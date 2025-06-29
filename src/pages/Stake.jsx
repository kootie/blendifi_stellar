import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance, getTokenPrice } from '../utils/tokens';
import { stakeBlend, getUserPosition, unstakeBlend, claimRewards } from '../utils/contract';

// Debug helper to log all relevant data
const debugLog = (label, data) => {
  console.log(`🔍 DEBUG ${label}:`, data);
};

// Enhanced amount conversion with detailed logging
function toContractAmount(amount, decimals) {
  try {
    debugLog('Amount Conversion Input', { amount, decimals, type: typeof amount });
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    const numAmount = parseFloat(amount);
    const multiplier = Math.pow(10, decimals);
    const result = Math.floor(numAmount * multiplier);
    
    debugLog('Amount Conversion Output', { 
      numAmount, 
      multiplier, 
      result, 
      bigIntResult: BigInt(result).toString() 
    });
    
    if (result > Number.MAX_SAFE_INTEGER) {
      throw new Error('Amount too large');
    }
    
    return BigInt(result);
  } catch (error) {
    console.error('❌ Amount conversion error:', error);
    throw error;
  }
}

const DebugStake = () => {
  const { isConnected, publicKey, kit } = useFreighter();
  const [balanceData, setBalanceData] = useState({
    blend: 0,
    xlm: 0,
    usdc: 0
  });
  const [rawBalanceData, setRawBalanceData] = useState({});
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (isConnected && publicKey) {
      loadAllData();
    }
  }, [isConnected, publicKey]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      debugLog('Loading data for', { publicKey, isConnected });
      
      // Check if we have the kit (Freighter connection)
      if (!kit) {
        throw new Error('Freighter kit not available');
      }
      
      // Get raw account data first
      const accountData = await kit.server.loadAccount(publicKey);
      debugLog('Raw Account Data', accountData);
      
      // Get balances for different tokens
      const balances = {};
      const rawBalances = {};
      
      // Get native XLM balance
      const xlmBalance = accountData.balances.find(b => b.asset_type === 'native');
      balances.xlm = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
      rawBalances.xlm = xlmBalance;
      
      debugLog('XLM Balance', { balance: balances.xlm, raw: xlmBalance });
      
      // Get BLEND balance
      try {
        const blendBalance = await getTokenBalance(publicKey, 'BLEND');
        balances.blend = blendBalance;
        debugLog('BLEND Balance from getTokenBalance', blendBalance);
      } catch (blendError) {
        console.error('❌ Error getting BLEND balance:', blendError);
        balances.blend = 0;
      }
      
      // Get USDC balance
      try {
        const usdcBalance = await getTokenBalance(publicKey, 'USDC');
        balances.usdc = usdcBalance;
        debugLog('USDC Balance from getTokenBalance', usdcBalance);
      } catch (usdcError) {
        console.error('❌ Error getting USDC balance:', usdcError);
        balances.usdc = 0;
      }
      
      // Check all balances in the account
      debugLog('All Account Balances', accountData.balances);
      
      setBalanceData(balances);
      setRawBalanceData(rawBalances);
      
      // Get staking data
      try {
        const position = await getUserPosition(publicKey);
        debugLog('User Position', position);
        setStakedAmount(position.staked_blend || 0);
        setRewards(position.rewards_earned || 0);
      } catch (positionError) {
        console.error('❌ Error getting user position:', positionError);
      }
      
      // Set debug info
      setDebugInfo({
        accountData: accountData,
        balances: balances,
        rawBalances: rawBalances,
        publicKey: publicKey,
        networkPassphrase: kit.networkPassphrase,
        serverUrl: kit.server.serverURL.href
      });
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    setError('');
    
    debugLog('Stake Attempt', {
      stakeAmount,
      blendBalance: balanceData.blend,
      publicKey,
      isConnected
    });
    
    // Enhanced validation
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid amount to stake');
      return;
    }
    
    const numStakeAmount = parseFloat(stakeAmount);
    
    if (numStakeAmount > balanceData.blend) {
      setError(`Insufficient BLEND balance. You have ${balanceData.blend} BLEND, trying to stake ${numStakeAmount}`);
      return;
    }
    
    // Check if amount is too small
    if (numStakeAmount < 0.0000001) {
      setError('Amount too small. Minimum stake amount is 0.0000001 BLEND');
      return;
    }
    
    setIsStaking(true);
    
    try {
      // Convert amount with detailed logging
      const contractAmount = toContractAmount(stakeAmount, 7);
      const contractAmountStr = contractAmount.toString();
      
      debugLog('Staking Parameters', {
        originalAmount: stakeAmount,
        contractAmount: contractAmountStr,
        publicKey: publicKey
      });
      
      // Check if we have enough XLM for transaction fees
      if (balanceData.xlm < 1) {
        setError('Insufficient XLM for transaction fees. You need at least 1 XLM.');
        return;
      }
      
      const result = await stakeBlend(publicKey, contractAmountStr);
      
      debugLog('Staking Result', result);
      
      if (result && result.successful) {
        setError('');
        alert('Successfully staked BLEND tokens!');
        setStakeAmount('');
        await loadAllData();
      } else {
        setError(`Staking failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Staking error:', error);
      setError(`Staking failed: ${error.message}`);
    } finally {
      setIsStaking(false);
    }
  };

  const handleMaxStake = () => {
    // Leave some buffer for transaction fees
    const maxAmount = Math.max(0, balanceData.blend - 0.1);
    setStakeAmount(maxAmount.toString());
  };

  const handleRefresh = () => {
    loadAllData();
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <div className="card">
          <h2 className="mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">
            Please connect your Freighter wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stake">
      <div className="flex justify-between items-center mb-8">
        <h1>Debug Staking & Balances</h1>
        <button onClick={handleRefresh} className="btn btn-secondary">
          🔄 Refresh Data
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading data...
        </div>
      )}

      {/* Balance Overview */}
      <section className="mb-8">
        <h2 className="mb-4">Balance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-2">XLM (Native)</h3>
            <div className="text-2xl font-bold text-primary mb-2">
              {balanceData.xlm.toFixed(7)}
            </div>
            <div className="text-sm text-secondary">
              Raw: {rawBalanceData.xlm?.balance || 'N/A'}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-bold mb-2">BLEND</h3>
            <div className="text-2xl font-bold text-success mb-2">
              {balanceData.blend.toFixed(7)}
            </div>
            <div className="text-sm text-secondary">
              Available for staking
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-bold mb-2">USDC</h3>
            <div className="text-2xl font-bold text-warning mb-2">
              {balanceData.usdc.toFixed(6)}
            </div>
            <div className="text-sm text-secondary">
              Available for swapping
            </div>
          </div>
        </div>
      </section>

      {/* Stake Section */}
      <section className="mb-8">
        <div className="card">
          <h2 className="mb-6">Stake BLEND</h2>
          
          <div className="form-group">
            <label className="form-label">Amount to Stake</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input flex-1"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="0"
                step="0.0000001"
              />
              <button
                onClick={handleMaxStake}
                className="btn btn-secondary"
                disabled={balanceData.blend <= 0}
              >
                MAX
              </button>
            </div>
            <div className="text-sm text-secondary mt-2">
              Available: {balanceData.blend.toFixed(7)} BLEND
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <span className="text-secondary">Stake Amount:</span>
              <span className="ml-2 font-mono">{stakeAmount || '0'}</span>
            </div>
            <div className="text-sm">
              <span className="text-secondary">Contract Amount:</span>
              <span className="ml-2 font-mono">
                {stakeAmount ? toContractAmount(stakeAmount, 7).toString() : '0'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleStake}
            className="btn btn-primary w-full"
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {isStaking ? (
              <>
                <div className="spinner"></div>
                Staking...
              </>
            ) : (
              'Stake BLEND'
            )}
          </button>
        </div>
      </section>

      {/* Debug Information */}
      <section className="mb-8">
        <div className="card">
          <h3 className="mb-4">Debug Information</h3>
          <div className="text-sm font-mono bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <div className="mb-2">
              <strong>Public Key:</strong> {publicKey}
            </div>
            <div className="mb-2">
              <strong>Network:</strong> {debugInfo.networkPassphrase}
            </div>
            <div className="mb-2">
              <strong>Server:</strong> {debugInfo.serverUrl}
            </div>
            <div className="mb-4">
              <strong>Balances:</strong>
              <pre>{JSON.stringify(balanceData, null, 2)}</pre>
            </div>
            <div className="mb-4">
              <strong>Raw Account Data:</strong>
              <pre>{JSON.stringify(debugInfo.accountData?.balances, null, 2)}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Guide */}
      <section className="mb-8">
        <div className="card">
          <h3 className="mb-4">Troubleshooting Guide</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-red-600">If you see "Insufficient Balance":</h4>
              <ul className="list-disc list-inside text-sm text-secondary mt-2">
                <li>Make sure you have BLEND tokens in your wallet</li>
                <li>Check if the token balance is loading correctly (see debug info above)</li>
                <li>Ensure you have enough XLM for transaction fees (minimum 1 XLM)</li>
                <li>Try refreshing the data with the refresh button</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-red-600">If staking fails:</h4>
              <ul className="list-disc list-inside text-sm text-secondary mt-2">
                <li>Check the browser console for detailed error messages</li>
                <li>Verify the contract address and network are correct</li>
                <li>Make sure Freighter is connected to the right network</li>
                <li>Try with a smaller amount first</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-red-600">If swapping fails:</h4>
              <ul className="list-disc list-inside text-sm text-secondary mt-2">
                <li>Check if you have the source token (USDC/BLEND)</li>
                <li>Verify the swap contract is deployed and accessible</li>
                <li>Make sure slippage tolerance is set correctly</li>
                <li>Check if the liquidity pool has sufficient funds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DebugStake; 
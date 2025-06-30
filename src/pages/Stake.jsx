import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance, debugStakeAttempt } from '../utils/tokens';
import { checkFreighter } from '../utils/checkFreighter';
import { stakeBlend, getUserPosition } from '../utils/contract';
import { useWalletWatcher } from '../hooks/useWalletWatcher';
import { Server as HorizonServer } from 'stellar-sdk';
import { requestAccess, isConnected } from '@stellar/freighter-api';
import { Server as SorobanServer, Contract, nativeToScVal, scValToNative, Networks } from 'soroban-client';
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import { Button } from "@nasa-jpl/react-stellar";

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
  const { isConnected, publicKey, kit, network } = useFreighter();
  // Debug log for all useFreighter values
  console.log('useFreighter values:', { isConnected, publicKey, kit, network });
  const { balance: liveXlmBalance, networkInfo } = useWalletWatcher(publicKey);
  const [balanceData, setBalanceData] = useState({
    blend: 0,
    xlm: 0,
    usdc: 0
  });
  const [rawBalanceData, setRawBalanceData] = useState({});
  const [stakeAmount, setStakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const [xlmBalance, setXlmBalance] = useState(null);
  const [blendBalance, setBlendBalance] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [stakeSuccess, setStakeSuccess] = useState(null);
  const [stakeError, setStakeError] = useState(null);

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
        // Print out all 3 for debugging
        console.error('Kit is null. Debug info:', {
          isConnected,
          publicKey,
          network
        });
        setError(`Freighter wallet not connected or network mismatch. Debug info: isConnected=${isConnected}, publicKey=${publicKey}, network=${network}`);
        setIsLoading(false);
        return;
      }
      
      // Get raw account data first
      const horizonServer = new HorizonServer('https://horizon-testnet.stellar.org');
      const accountData = await horizonServer.loadAccount(publicKey);
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
        const sorobanServer = new SorobanServer('https://soroban-testnet.stellar.org');
        const contract = new Contract(TOKENS.BLEND.address);
        const result = await contract.call(
          sorobanServer,
          'balance',
          [nativeToScVal(publicKey, { type: 'address' })],
          { networkPassphrase: Networks.TESTNET }
        );
        balances.blend = scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals);
        debugLog('BLEND Balance from getTokenBalance', balances.blend);
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
        serverUrl: kit.server.serverURL.href,
        horizonUrl: kit.horizonUrl,
      });
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    setStakeError(null);
    setStakeSuccess(null);
    try {
      console.log('Requesting access to Freighter...');
      await requestAccess();
      console.log('Access granted. Getting public key...');
      const { address: pubKey } = await requestAccess();
      console.log('Got public key:', pubKey);
      // 2. Validate input
      if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
        setStakeError('Please enter a valid amount');
        return;
      }
      // Only BLEND can be staked; add your logic here if you support more tokens
      if (false) {
        setStakeError('Only BLEND tokens can be staked');
        return;
      }
      setIsStaking(true);
      try {
        // Centralize blockchain call (dummy implementation, replace with your stakeBlend util)
        // const result = await stakeBlend(pubKey, stakeAmount, signTransaction);
        const result = { success: true, hash: 'dummyhash', error: null };
        if (result.success) {
          setStakeSuccess('Stake successful!');
          setStakeAmount('');
        } else {
          setStakeError(`Stake failed: ${result.error}`);
        }
      } catch {
        setStakeError('Stake failed. Please try again.');
      } finally {
        setIsStaking(false);
      }
    } catch (err) {
      console.error('Freighter connection error:', err);
      setStakeError('Please connect your wallet first');
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

  const loadBalances = async () => {
    setLoadingBalances(true);
    setBalanceError('');
    try {
      const connected = await isConnected();
      if (!connected) await requestAccess();
      await getPublicKey();
      // Fetch account details from Horizon
      const server = new Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);
      // XLM
      const xlm = account.balances.find(b => b.asset_type === 'native');
      setXlmBalance(xlm ? parseFloat(xlm.balance) : 0);
      // BLEND (Soroban contract)
      const sorobanServer = new SorobanServer('https://soroban-testnet.stellar.org');
      const contract = new Contract(TOKENS.BLEND.address);
      const result = await contract.call(
        sorobanServer,
        'balance',
        [nativeToScVal(publicKey, { type: 'address' })],
        { networkPassphrase: Networks.TESTNET }
      );
      setBlendBalance(scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals));
    } catch (err) {
      setBalanceError('❌ Could not load wallet or BLEND balances.');
      setXlmBalance(null);
      setBlendBalance(null);
      console.error(err);
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, []);

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
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>Stake BLEND</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="stakeAmount">Amount to Stake:</label>
        <input
          id="stakeAmount"
          type="number"
          value={stakeAmount}
          onChange={e => setStakeAmount(e.target.value)}
          style={{ marginLeft: 8, width: 120 }}
        />
      </div>
      {stakeError && <div style={{ marginBottom: 12, padding: 8, background: '#fee', color: '#b00', borderRadius: 4 }}>{stakeError}</div>}
      {stakeSuccess && <div style={{ marginBottom: 12, padding: 8, background: '#efe', color: '#080', borderRadius: 4 }}>{stakeSuccess}</div>}
      <button className="btn btn-logo" onClick={handleStake} disabled={isStaking} style={{ background: '#2563EB', boxShadow: '0 2px 8px #3B82F633', padding: '0.75em 2em', fontSize: '1.1rem' }}>
        <img src="/blendifi (1).jpg" alt="bloe logo" className="bloe-logo" style={{ width: 40, height: 40, objectFit: 'contain', background: '#fff' }} />
        {isStaking ? 'Staking...' : 'Stake'}
      </button>
    </div>
  );
};

export default DebugStake; 
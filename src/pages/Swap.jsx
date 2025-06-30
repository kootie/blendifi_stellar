import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenPrice } from '../utils/tokens';
import { requestAccess } from '@stellar/freighter-api';
import { Server } from 'stellar-sdk';
import { Server as SorobanServer, Contract, nativeToScVal, scValToNative, Networks } from 'soroban-client';
// Add toast import if available
// import { toast } from 'sonner';
// Add react-stellar imports
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import { Button } from "@nasa-jpl/react-stellar";

const Swap = () => {
  const { isConnected, publicKey } = useFreighter();
  const [fromToken, setFromToken] = useState('XLM');
  const [toToken, setToToken] = useState('BLEND');
  const [amount, setAmount] = useState('');
  const [fromBalance, setFromBalance] = useState(null);
  const [toBalance, setToBalance] = useState(null);
  const [xlmBalance, setXlmBalance] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const slippage = 0.5; // 0.5% default
  const [price, setPrice] = useState(1);
  const [swapSuccess, setSwapSuccess] = useState(null);
  const [swapError, setSwapError] = useState(null);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadBalances();
      updatePrice();
    }
    // eslint-disable-next-line
  }, [isConnected, publicKey, fromToken, toToken]);

  const loadBalances = async () => {
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
      // From token
      if (fromToken === 'BLEND') {
        const sorobanServer = new SorobanServer('https://soroban-testnet.stellar.org');
        const contract = new Contract(TOKENS.BLEND.address);
        const result = await contract.call(
          sorobanServer,
          'balance',
          [nativeToScVal(publicKey, { type: 'address' })],
          { networkPassphrase: Networks.TESTNET }
        );
        setFromBalance(scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals));
      } else {
        const tokenBal = account.balances.find(b => b.asset_code === fromToken);
        setFromBalance(tokenBal ? parseFloat(tokenBal.balance) : 0);
      }
      // To token
      if (toToken === 'BLEND') {
        const sorobanServer = new SorobanServer('https://soroban-testnet.stellar.org');
        const contract = new Contract(TOKENS.BLEND.address);
        const result = await contract.call(
          sorobanServer,
          'balance',
          [nativeToScVal(publicKey, { type: 'address' })],
          { networkPassphrase: Networks.TESTNET }
        );
        setToBalance(scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals));
      } else {
        const tokenBal = account.balances.find(b => b.asset_code === toToken);
        setToBalance(tokenBal ? parseFloat(tokenBal.balance) : 0);
      }
    } catch {
      setXlmBalance(null);
      setFromBalance(null);
      setToBalance(null);
    }
  };

  const updatePrice = () => {
    // Simple price ratio for MVP
    const fromPrice = getTokenPrice(fromToken);
    const toPrice = getTokenPrice(toToken);
    setPrice(toPrice / fromPrice);
  };

  const handleSwap = async () => {
    setSwapError(null);
    setSwapSuccess(null);
    try {
      console.log('Requesting access to Freighter...');
      await requestAccess();
      console.log('Access granted. Getting public key...');
      const { address: pubKey } = await requestAccess();
      console.log('Got public key:', pubKey);
      // 2. Validate input
      if (!amount || parseFloat(amount) <= 0) {
        setSwapError('Please enter a valid amount');
        return;
      }
      if (fromToken === toToken) {
        setSwapError('Cannot swap the same token');
        return;
      }
      setIsSwapping(true);
      try {
        // 3. Centralize blockchain call (dummy implementation, replace with your swapTokens util)
        // const result = await swapTokens(pubKey, fromToken, toToken, amount, minAmountOut, signTransaction);
        // For now, just simulate success:
        const result = { success: true, hash: 'dummyhash', error: null };
        if (result.success) {
          setSwapSuccess(`Swap successful! Hash: ${result.hash}`);
          setAmount('');
        } else {
          setSwapError(`Swap failed: ${result.error}`);
        }
      } catch {
        setSwapError('Swap failed. Please try again.');
      } finally {
        setIsSwapping(false);
      }
    } catch (err) {
      console.error('Freighter connection error:', err);
      setSwapError('Please connect your wallet first');
    }
  };

  const handleFromTokenChange = (e) => {
    setFromToken(e.target.value);
    if (e.target.value === toToken) {
      // Auto switch toToken if same
      const other = Object.keys(TOKENS).find((t) => t !== e.target.value);
      setToToken(other);
    }
  };

  const handleToTokenChange = (e) => {
    setToToken(e.target.value);
    if (e.target.value === fromToken) {
      const other = Object.keys(TOKENS).find((t) => t !== e.target.value);
      setFromToken(other);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>Token Swap</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="fromToken">From Token:</label>
        <select id="fromToken" value={fromToken} onChange={e => setFromToken(e.target.value)} style={{ marginLeft: 8 }}>
          {Object.keys(TOKENS).map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
        <div className="text-sm text-secondary mt-2">
          Balance: {fromBalance?.toFixed(4) || 'Loading...'} {fromToken}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="toToken">To Token:</label>
        <select id="toToken" value={toToken} onChange={e => setToToken(e.target.value)} style={{ marginLeft: 8 }}>
          {Object.keys(TOKENS).map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
        <div className="text-sm text-secondary mt-2">
          Balance: {toBalance?.toFixed(4) || 'Loading...'} {toToken}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="amount">Amount:</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ marginLeft: 8, width: 120 }}
        />
      </div>
      <div className="form-group flex justify-between text-sm mb-2">
        <span>Price:</span>
        <span>1 {fromToken} ≈ {price.toFixed(4)} {toToken}</span>
      </div>
      <div className="form-group flex justify-between text-sm mb-2">
        <span>Slippage Tolerance:</span>
        <span>{slippage}%</span>
      </div>
      <div className="form-group flex justify-between text-sm mb-4">
        <span>Minimum Received:</span>
        <span>
          {amount ? (parseFloat(amount) * price * (1 - slippage / 100)).toFixed(4) : '0.0000'} {toToken}
        </span>
      </div>
      {swapError && <div style={{ marginBottom: 12, padding: 8, background: '#fee', color: '#b00', borderRadius: 4 }}>{swapError}</div>}
      {swapSuccess && <div style={{ marginBottom: 12, padding: 8, background: '#efe', color: '#080', borderRadius: 4 }}>{swapSuccess}</div>}
      <button className="btn btn-logo" onClick={handleSwap} disabled={isSwapping}>
        <img src="/src/assets/react.svg" alt="bloe logo" className="bloe-logo" />
        {isSwapping ? 'Swapping...' : 'Swap'}
      </button>
    </div>
  );
};

export default Swap; 
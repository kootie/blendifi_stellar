import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance } from '../utils/tokens';
import { swapTokens } from '../utils/contract';

const Swap = () => {
  const { isConnected, publicKey } = useFreighter();
  const [fromToken, setFromToken] = useState('XLM');
  const [toToken, setToToken] = useState('BLEND');
  const [amount, setAmount] = useState('');
  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(null);
  const slippage = 0.5; // 0.5% default
  const price = 1; // Placeholder: 1:1 for MVP

  // Load balances for selected tokens
  const loadBalances = async () => {
    if (!isConnected || !publicKey) return;
    try {
      const fromBal = await getTokenBalance(publicKey, fromToken);
      setFromBalance(Number(fromBal) || 0);
      const toBal = await getTokenBalance(publicKey, toToken);
      setToBalance(Number(toBal) || 0);
    } catch {
      setFromBalance(0);
      setToBalance(0);
    }
  };

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line
  }, [isConnected, publicKey, fromToken, toToken]);

  // Handle swap
  const handleSwap = async () => {
    setSwapError('');
    setSwapSuccess(null);
    if (!amount || parseFloat(amount) <= 0) {
      setSwapError('Enter a valid amount');
      return;
    }
    if (fromToken === toToken) {
      setSwapError('Cannot swap the same token');
      return;
    }
    setIsSwapping(true);
    try {
      const fromDecimals = TOKENS[fromToken].decimals;
      const toDecimals = TOKENS[toToken].decimals;
      const amountIn = (parseFloat(amount) * Math.pow(10, fromDecimals)).toString();
      // Calculate minAmountOut with slippage
      const minAmountOut = (parseFloat(amount) * price * (1 - slippage / 100) * Math.pow(10, toDecimals)).toString();
      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 min from now
      const result = await swapTokens(publicKey, fromToken, toToken, amountIn, minAmountOut, deadline);
      if (result && result.hash) {
        setSwapSuccess(
          <span>
            Swap successful! <a href={`https://testnet.stellarchain.io/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Tx</a>
          </span>
        );
        setAmount('');
        loadBalances();
      } else {
        setSwapError(result?.errorResult || result?.status || 'Unknown error');
      }
    } catch {
      setSwapError('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
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

  if (!isConnected) {
    return (
      <div className="text-center">
        <div className="card">
          <h2 className="mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">Please connect your Freighter wallet to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Token Swap</h2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSwap(); }}>
        <div>
          <label htmlFor="fromToken" className="form-label">From Token</label>
          <select id="fromToken" value={fromToken} onChange={handleFromTokenChange} className="form-select w-full mt-1">
            {Object.keys(TOKENS).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {fromBalance?.toFixed(4)} {fromToken}
          </div>
        </div>
        <div>
          <label htmlFor="toToken" className="form-label">To Token</label>
          <select id="toToken" value={toToken} onChange={handleToTokenChange} className="form-select w-full mt-1">
            {Object.keys(TOKENS).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {toBalance?.toFixed(4)} {toToken}
          </div>
        </div>
        <div>
          <label htmlFor="amount" className="form-label">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="form-input w-full"
            placeholder="0.0"
            min="0"
          />
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Price:</span>
          <span>1 {fromToken} ≈ {price.toFixed(4)} {toToken}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Slippage Tolerance:</span>
          <span>{slippage}%</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span>Minimum Received:</span>
          <span>
            {amount ? (parseFloat(amount) * price * (1 - slippage / 100)).toFixed(4) : '0.0000'} {toToken}
          </span>
        </div>
        {swapError && <div className="bg-error/10 text-error rounded p-2 text-sm">{swapError}</div>}
        {swapSuccess && <div className="bg-success/10 text-success rounded p-2 text-sm">{swapSuccess}</div>}
        <button type="submit" className="btn btn-logo" disabled={isSwapping}>
          {isSwapping ? 'Swapping...' : 'Swap'}
        </button>
      </form>
    </div>
  );
};

export default Swap; 
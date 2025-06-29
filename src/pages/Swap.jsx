import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance, getTokenPrice } from '../utils/tokens';
import { swapTokens } from '../utils/contract';

function toContractAmount(amount, decimals) {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
}

const Swap = () => {
  const { isConnected, publicKey } = useFreighter();
  const [fromToken, setFromToken] = useState('XLM');
  const [toToken, setToToken] = useState('BLEND');
  const [amount, setAmount] = useState('');
  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const slippage = 0.5; // 0.5% default
  const [price, setPrice] = useState(1);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadBalances();
      updatePrice();
    }
    // eslint-disable-next-line
  }, [isConnected, publicKey, fromToken, toToken]);

  const loadBalances = async () => {
    const fromBal = await getTokenBalance(publicKey, fromToken);
    const toBal = await getTokenBalance(publicKey, toToken);
    setFromBalance(fromBal);
    setToBalance(toBal);
  };

  const updatePrice = () => {
    // Simple price ratio for MVP
    const fromPrice = getTokenPrice(fromToken);
    const toPrice = getTokenPrice(toToken);
    setPrice(toPrice / fromPrice);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount to swap');
      return;
    }
    if (parseFloat(amount) > fromBalance) {
      alert('Insufficient balance');
      return;
    }
    if (fromToken === toToken) {
      alert('Please select different tokens');
      return;
    }
    setIsSwapping(true);
    try {
      // Calculate minimum amount out with slippage
      const amountIn = toContractAmount(amount, TOKENS[fromToken].decimals).toString();
      const expectedAmountOut = parseFloat(amount) * price;
      const minAmountOut = toContractAmount(expectedAmountOut * (1 - slippage / 100), TOKENS[toToken].decimals).toString();
      // Get token addresses
      const fromTokenAddress = TOKENS[fromToken].address;
      const toTokenAddress = TOKENS[toToken].address;
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60; // 20 minutes from now
      // Call the real Soroban contract swap function
      const result = await swapTokens(publicKey, fromTokenAddress, toTokenAddress, amountIn, minAmountOut, deadline);
      if (result && result.successful) {
        alert('Swap successful!');
        setAmount('');
        loadBalances();
      } else {
        alert('Swap failed. Please try again.');
      }
    } catch (error) {
      console.error('Swap error:', error);
      alert(`Swap failed: ${error.message}`);
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
          <p className="text-secondary mb-6">
            Please connect your Freighter wallet to swap tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="swap">
      <h1 className="mb-8">Swap Tokens</h1>
      <div className="card max-w-md mx-auto">
        <div className="form-group">
          <label className="form-label">From</label>
          <select
            className="form-select"
            value={fromToken}
            onChange={handleFromTokenChange}
          >
            {Object.keys(TOKENS).map((symbol) => (
              <option key={symbol} value={symbol}>
                {TOKENS[symbol].icon} {TOKENS[symbol].symbol}
              </option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {fromBalance.toFixed(4)} {fromToken}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">To</label>
          <select
            className="form-select"
            value={toToken}
            onChange={handleToTokenChange}
          >
            {Object.keys(TOKENS).map((symbol) => (
              <option key={symbol} value={symbol}>
                {TOKENS[symbol].icon} {TOKENS[symbol].symbol}
              </option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {toBalance.toFixed(4)} {toToken}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.0001"
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
        <button
          onClick={handleSwap}
          className="btn btn-primary w-full"
          disabled={isSwapping || !amount || parseFloat(amount) <= 0}
        >
          {isSwapping ? (
            <>
              <div className="spinner"></div>
              Swapping...
            </>
          ) : (
            'Swap'
          )}
        </button>
      </div>
      <section className="mt-8 max-w-md mx-auto">
        <div className="card">
          <h3 className="mb-2">How Swapping Works</h3>
          <p className="text-secondary text-sm mb-2">
            Swap tokens instantly at the best available rates. All swaps are executed on the Stellar blockchain with slippage protection.
          </p>
          <ul className="text-sm text-secondary list-disc pl-6">
            <li>Choose the tokens you want to swap</li>
            <li>Enter the amount and review the price</li>
            <li>Confirm the transaction in your Freighter wallet</li>
            <li>Receive your tokens instantly</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Swap; 
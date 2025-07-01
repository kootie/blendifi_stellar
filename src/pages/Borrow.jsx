import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance } from '../utils/tokens';
import { borrowFromBlend } from '../utils/contract';

const Borrow = () => {
  const { isConnected, publicKey } = useFreighter();
  const [collateralToken, setCollateralToken] = useState('BLEND');
  const [borrowToken, setBorrowToken] = useState('USDC');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState('');
  const [borrowSuccess, setBorrowSuccess] = useState(null);
  const LTV = 0.6; // 60% Loan-to-Value
  const price = 1; // Placeholder: 1:1 for MVP
  const [maxBorrow, setMaxBorrow] = useState(0);

  // Load collateral balance
  const loadBalances = async () => {
    if (!isConnected || !publicKey) return;
    try {
      const bal = await getTokenBalance(publicKey, collateralToken);
      setCollateralBalance(Number(bal) || 0);
    } catch {
      setCollateralBalance(0);
    }
  };

  // Update max borrowable amount
  const updateMaxBorrow = () => {
    const max = (parseFloat(collateralAmount || 0) * price * LTV) / price;
    setMaxBorrow(max);
  };

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line
  }, [isConnected, publicKey, collateralToken]);

  useEffect(() => {
    updateMaxBorrow();
    // eslint-disable-next-line
  }, [collateralAmount, collateralToken, borrowToken]);

  // Handle borrow
  const handleBorrow = async () => {
    setBorrowError('');
    setBorrowSuccess(null);
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      setBorrowError('Enter a valid amount');
      return;
    }
    setIsBorrowing(true);
    try {
      const borrowDecimals = TOKENS[borrowToken].decimals;
      const borrowAmountIn = (parseFloat(borrowAmount) * Math.pow(10, borrowDecimals)).toString();
      const result = await borrowFromBlend(publicKey, borrowToken, borrowAmountIn);
      if (result && result.hash) {
        setBorrowSuccess(
          <span>
            Borrow successful! <a href={`https://testnet.stellarchain.io/tx/${result.hash}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Tx</a>
          </span>
        );
        setBorrowAmount('');
        setCollateralAmount('');
        loadBalances();
      } else {
        setBorrowError(result?.errorResult || result?.status || 'Unknown error');
      }
    } catch {
      setBorrowError('Borrow failed. Please try again.');
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleCollateralTokenChange = (e) => {
    setCollateralToken(e.target.value);
    if (e.target.value === borrowToken) {
      const other = Object.keys(TOKENS).find((t) => t !== e.target.value);
      setBorrowToken(other);
    }
  };

  const handleBorrowTokenChange = (e) => {
    setBorrowToken(e.target.value);
    if (e.target.value === collateralToken) {
      const other = Object.keys(TOKENS).find((t) => t !== e.target.value);
      setCollateralToken(other);
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
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Borrow Assets</h2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleBorrow(); }}>
        <div>
          <label htmlFor="collateralToken" className="form-label">Collateral Token</label>
          <select id="collateralToken" value={collateralToken} onChange={handleCollateralTokenChange} className="form-select w-full mt-1">
            {Object.keys(TOKENS).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {collateralBalance?.toFixed(4)} {collateralToken}
          </div>
        </div>
        <div>
          <label htmlFor="collateralAmount" className="form-label">Collateral Amount</label>
          <input
            id="collateralAmount"
            type="number"
            value={collateralAmount}
            onChange={e => setCollateralAmount(e.target.value)}
            className="form-input w-full"
            placeholder="0.0"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="borrowToken" className="form-label">Borrow Token</label>
          <select id="borrowToken" value={borrowToken} onChange={handleBorrowTokenChange} className="form-select w-full mt-1">
            {Object.keys(TOKENS).map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="borrowAmount" className="form-label">Amount to Borrow</label>
          <input
            id="borrowAmount"
            type="number"
            value={borrowAmount}
            onChange={e => setBorrowAmount(e.target.value)}
            className="form-input w-full"
            placeholder="0.0"
            min="0"
          />
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Max Borrow (60% LTV):</span>
          <span>{maxBorrow.toFixed(4)} {borrowToken}</span>
        </div>
        {borrowError && <div className="bg-error/10 text-error rounded p-2 text-sm">{borrowError}</div>}
        {borrowSuccess && <div className="bg-success/10 text-success rounded p-2 text-sm">{borrowSuccess}</div>}
        <button type="submit" className="btn btn-logo" disabled={isBorrowing}>
          {isBorrowing ? 'Borrowing...' : 'Borrow'}
        </button>
      </form>
    </div>
  );
};

export default Borrow; 
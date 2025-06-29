import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenBalance, getTokenPrice } from '../utils/tokens';
import { borrowFromBlend, supplyToBlend } from '../utils/contract';

function toContractAmount(amount, decimals) {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
}

const Borrow = () => {
  const { isConnected, publicKey } = useFreighter();
  const [collateralToken, setCollateralToken] = useState('BLEND');
  const [borrowToken, setBorrowToken] = useState('USDC');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [maxBorrow, setMaxBorrow] = useState(0);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadBalances();
      updateMaxBorrow();
    }
    // eslint-disable-next-line
  }, [isConnected, publicKey, collateralToken, collateralAmount, borrowToken]);

  const loadBalances = async () => {
    const bal = await getTokenBalance(publicKey, collateralToken);
    setCollateralBalance(bal);
  };

  const updateMaxBorrow = () => {
    // For MVP, assume 60% LTV
    const priceCollateral = getTokenPrice(collateralToken);
    const priceBorrow = getTokenPrice(borrowToken);
    const max = (parseFloat(collateralAmount || 0) * priceCollateral * 0.6) / priceBorrow;
    setMaxBorrow(max);
  };

  const handleBorrow = async () => {
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      alert('Enter a valid collateral amount');
      return;
    }
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      alert('Enter a valid borrow amount');
      return;
    }
    if (parseFloat(collateralAmount) > collateralBalance) {
      alert('Insufficient collateral balance');
      return;
    }
    if (parseFloat(borrowAmount) > maxBorrow) {
      alert('Borrow amount exceeds limit');
      return;
    }
    setIsBorrowing(true);
    try {
      // Get token addresses
      const borrowTokenAddress = TOKENS[borrowToken].address;
      const collateralTokenAddress = TOKENS[collateralToken].address;
      const contractBorrowAmount = toContractAmount(borrowAmount, TOKENS[borrowToken].decimals).toString();
      // Call the real Soroban contract borrow function
      const result = await borrowFromBlend(publicKey, borrowTokenAddress, contractBorrowAmount);
      if (result && result.successful) {
        alert('Borrow successful!');
        setBorrowAmount('');
        setCollateralAmount('');
        loadBalances();
      } else {
        alert('Borrow failed. Please try again.');
      }
    } catch (error) {
      console.error('Borrow error:', error);
      alert(`Borrow failed: ${error.message}`);
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
          <p className="text-secondary mb-6">
            Please connect your Freighter wallet to borrow assets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="borrow">
      <h1 className="mb-8">Borrow Assets</h1>
      <div className="card max-w-md mx-auto">
        <div className="form-group">
          <label className="form-label">Collateral Token</label>
          <select
            className="form-select"
            value={collateralToken}
            onChange={handleCollateralTokenChange}
          >
            {Object.keys(TOKENS).map((symbol) => (
              <option key={symbol} value={symbol}>
                {TOKENS[symbol].icon} {TOKENS[symbol].symbol}
              </option>
            ))}
          </select>
          <div className="text-sm text-secondary mt-2">
            Balance: {collateralBalance.toFixed(4)} {collateralToken}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Collateral Amount</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            min="0"
            step="0.0001"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Borrow Token</label>
          <select
            className="form-select"
            value={borrowToken}
            onChange={handleBorrowTokenChange}
          >
            {Object.keys(TOKENS).map((symbol) => (
              <option key={symbol} value={symbol}>
                {TOKENS[symbol].icon} {TOKENS[symbol].symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Borrow Amount</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            min="0"
            step="0.0001"
          />
        </div>
        <div className="form-group flex justify-between text-sm mb-2">
          <span>Max Borrow:</span>
          <span>{maxBorrow.toFixed(4)} {borrowToken}</span>
        </div>
        <div className="form-group flex justify-between text-sm mb-4">
          <span>Collateralization Ratio:</span>
          <span>60%</span>
        </div>
        <button
          onClick={handleBorrow}
          className="btn btn-primary w-full"
          disabled={isBorrowing || !collateralAmount || !borrowAmount || parseFloat(collateralAmount) <= 0 || parseFloat(borrowAmount) <= 0}
        >
          {isBorrowing ? (
            <>
              <div className="spinner"></div>
              Borrowing...
            </>
          ) : (
            'Borrow'
          )}
        </button>
      </div>
      <section className="mt-8 max-w-md mx-auto">
        <div className="card">
          <h3 className="mb-2">How Borrowing Works</h3>
          <p className="text-secondary text-sm mb-2">
            Borrow assets by providing collateral. Your borrowing capacity is determined by the value of your collateral and the protocol's collateralization ratio.
          </p>
          <ul className="text-sm text-secondary list-disc pl-6">
            <li>Choose a collateral token and amount</li>
            <li>Select the asset you want to borrow</li>
            <li>Confirm the transaction in your Freighter wallet</li>
            <li>Manage your position in the dashboard</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Borrow; 
import { useState, useEffect } from 'react';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getTokenPrice } from '../utils/tokens';
import { useWalletWatcher } from '../hooks/useWalletWatcher';
import { getPublicKey, requestAccess, isConnected } from '@stellar/freighter-api';
import { Server } from 'stellar-sdk';
import { Server as SorobanServer, Contract, nativeToScVal, scValToNative, Networks } from 'soroban-client';
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import { Button } from "@nasa-jpl/react-stellar";
// import { toast } from 'sonner';

const Borrow = () => {
  const { isConnected: freighterIsConnected, publicKey } = useFreighter();
  const { networkInfo } = useWalletWatcher(publicKey);
  const [collateralToken, setCollateralToken] = useState('BLEND');
  const [borrowToken, setBorrowToken] = useState('USDC');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [xlmBalance, setXlmBalance] = useState(null);
  const [collateralBalance, setCollateralBalance] = useState(null);
  const [borrowSuccess, setBorrowSuccess] = useState(null);
  const [borrowError, setBorrowError] = useState(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [maxBorrow, setMaxBorrow] = useState(0);

  useEffect(() => {
    if (freighterIsConnected && publicKey) {
      loadBalances();
      updateMaxBorrow();
    }
    // eslint-disable-next-line
  }, [freighterIsConnected, publicKey, collateralToken, collateralAmount, borrowToken]);

  const loadBalances = async () => {
    try {
      const connected = await isConnected();
      if (!connected) await requestAccess();
      const pubKey = await getPublicKey();
      // Fetch account details from Horizon
      const server = new Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(pubKey);
      // XLM
      const xlm = account.balances.find(b => b.asset_type === 'native');
      setXlmBalance(xlm ? parseFloat(xlm.balance) : 0);
      // Collateral (Soroban contract if BLEND, else from Horizon)
      if (collateralToken === 'BLEND') {
        const sorobanServer = new SorobanServer('https://soroban-testnet.stellar.org');
        const contract = new Contract(TOKENS.BLEND.address);
        const result = await contract.call(
          sorobanServer,
          'balance',
          [nativeToScVal(pubKey, { type: 'address' })],
          { networkPassphrase: Networks.TESTNET }
        );
        setCollateralBalance(scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals));
      } else {
        const tokenBal = account.balances.find(b => b.asset_code === collateralToken);
        setCollateralBalance(tokenBal ? parseFloat(tokenBal.balance) : 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateMaxBorrow = () => {
    // For MVP, assume 60% LTV
    const priceCollateral = getTokenPrice(collateralToken);
    const priceBorrow = getTokenPrice(borrowToken);
    const max = (parseFloat(collateralAmount || 0) * priceCollateral * 0.6) / priceBorrow;
    setMaxBorrow(max);
  };

  const handleBorrow = async () => {
    setBorrowError(null);
    setBorrowSuccess(null);
    try {
      console.log('Requesting access to Freighter...');
      await requestAccess();
      console.log('Access granted. Getting public key...');
      const { address: pubKey } = await requestAccess();
      console.log('Got public key:', pubKey);
      // 2. Validate input
      if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
        setBorrowError('Please enter a valid amount');
        return;
      }
      setIsBorrowing(true);
      try {
        // Centralize blockchain call (dummy implementation, replace with your borrowFromBlend util)
        // const result = await borrowFromBlend(pubKey, borrowToken, borrowAmount, signTransaction);
        const result = { success: true, hash: 'dummyhash', error: null };
        if (result.success) {
          setBorrowSuccess('Borrow successful!');
          setBorrowAmount('');
        } else {
          setBorrowError(`Borrow failed: ${result.error}`);
        }
      } catch {
        setBorrowError('Borrow failed. Please try again.');
      } finally {
        setIsBorrowing(false);
      }
    } catch (err) {
      console.error('Freighter connection error:', err);
      setBorrowError('Please connect your wallet first');
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

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ marginBottom: 16 }}>Borrow Assets</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="borrowAmount">Amount to Borrow:</label>
        <input
          id="borrowAmount"
          type="number"
          value={borrowAmount}
          onChange={e => setBorrowAmount(e.target.value)}
          style={{ marginLeft: 8, width: 120 }}
        />
      </div>
      {borrowError && <div style={{ marginBottom: 12, padding: 8, background: '#fee', color: '#b00', borderRadius: 4 }}>{borrowError}</div>}
      {borrowSuccess && <div style={{ marginBottom: 12, padding: 8, background: '#efe', color: '#080', borderRadius: 4 }}>{borrowSuccess}</div>}
      <button className="btn btn-logo" onClick={handleBorrow} disabled={isBorrowing} style={{ background: '#2563EB', boxShadow: '0 2px 8px #3B82F633', padding: '0.75em 2em', fontSize: '1.1rem' }}>
        <img src="/blendifi (1).jpg" alt="bloe logo" className="bloe-logo" style={{ width: 40, height: 40, objectFit: 'contain', background: '#fff' }} />
        {isBorrowing ? 'Borrowing...' : 'Borrow'}
      </button>
    </div>
  );
};

export default Borrow; 
import React, { useEffect, useState } from 'react';
import { getPublicKey, requestAccess, isConnected } from '@stellar/freighter-api';
import { Server } from 'stellar-sdk';
import { Server as SorobanServer, Contract, nativeToScVal, scValToNative, Networks } from 'soroban-client';
import { TOKENS } from '../utils/tokens';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC = 'https://soroban-testnet.stellar.org';
const BLEND_CONTRACT_ID = 'CB22KRA3YZVCNCQI64JQ5WE7UY2VAV7WFLK6A2JN3HEX56T2EDAFO7QF'; // Replace with your actual contract ID

export default function WalletBalance() {
  const [publicKey, setPublicKey] = useState('');
  const [blendBalance, setBlendBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [xlmBalance, setXlmBalance] = useState(null);
  const [customTokenBalances, setCustomTokenBalances] = useState({});

  const loadBalances = async () => {
    setLoading(true);
    setError('');
    try {
      const connected = await isConnected();
      if (!connected) await requestAccess();
      const pubKey = await getPublicKey();
      setPublicKey(pubKey);

      // Fetch account details from Horizon
      const server = new Server(HORIZON_URL);
      const account = await server.loadAccount(pubKey);
      // Extract XLM and custom token balances
      const xlm = account.balances.find(b => b.asset_type === 'native');
      setXlmBalance(xlm ? parseFloat(xlm.balance) : 0);
      // Parse custom tokens (non-native)
      const customBalances = {};
      account.balances.forEach(b => {
        if (b.asset_type !== 'native') {
          customBalances[b.asset_code] = parseFloat(b.balance);
        }
      });
      setCustomTokenBalances(customBalances);

      // BLEND (Soroban contract)
      const sorobanServer = new SorobanServer(SOROBAN_RPC);
      const contract = new Contract(BLEND_CONTRACT_ID);
      const result = await contract.call(
        sorobanServer,
        'balance',
        [nativeToScVal(pubKey, { type: 'address' })],
        { networkPassphrase: Networks.TESTNET }
      );
      setBlendBalance(scValToNative(result) / Math.pow(10, TOKENS.BLEND.decimals));
    } catch (err) {
      setError('❌ Could not load wallet or BLEND balances.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔐 Freighter Wallet Balances</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {publicKey && <p><strong>Wallet:</strong> {publicKey}</p>}
      <ul>
        <li>
          XLM: {xlmBalance !== null ? xlmBalance.toFixed(TOKENS.XLM.decimals) : '...'}
        </li>
        {Object.entries(customTokenBalances).map(([code, bal]) => (
          <li key={code}>
            {code}: {bal.toFixed(TOKENS[code]?.decimals || 7)}
          </li>
        ))}
        <li>BLEND (Soroban): {blendBalance !== null ? blendBalance.toFixed(TOKENS.BLEND.decimals) : '...'}</li>
      </ul>
      <button onClick={loadBalances}>🔄 Refresh</button>
    </div>
  );
} 
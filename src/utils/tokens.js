// Token definitions for Blendifi DeFi MVP
export const TOKENS = {
  BLEND: {
    symbol: 'BLEND',
    name: 'Blend Token',
    address: 'CB22KRA3YZVCNCQI64JQ5WE7UY2VAV7WFLK6A2JN3HEX56T2EDAFO7QF',
    decimals: 7,
    icon: '🪙'
  },
  XLM: {
    symbol: 'XLM',
    name: 'Stellar Lumens',
    type: 'native', // No contract address for native XLM
    decimals: 7,
    icon: '⭐'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU',
    decimals: 6,
    icon: '💵'
  },
  wETH: {
    symbol: 'wETH',
    name: 'Wrapped Ether',
    address: 'CAZAQB3D7KSLSNOSQKYD2V4JP5V2Y3B4RDJZRLBFCCIXDCTE3WHSY3UE',
    decimals: 18,
    icon: 'Ξ'
  },
  wBTC: {
    symbol: 'wBTC',
    name: 'Wrapped Bitcoin',
    address: 'CAP5AMC2OHNVREO66DFIN6DHJMPOBAJ2KCDDIMFBR7WWJH5RZBFM3UEI',
    decimals: 8,
    icon: '₿'
  }
};

import { getAssetPrice, SOROBAN_RPC } from './contract';
import * as SorobanClient from 'soroban-client';
import { Server } from 'stellar-sdk';
import { checkFreighter } from './checkFreighter';

const HORIZON_URL = 'https://horizon-testnet.stellar.org'; // Change to mainnet if needed

export const getTokenPrice = async (symbol) => {
  const token = TOKENS[symbol];
  if (!token) return 0;
  try {
    const price = await getAssetPrice(token.address);
    return Number(price) || 0;
  } catch {
    return 0;
  }
};

export const getTokenBalance = async (address, tokenSymbol) => {
  const token = TOKENS[tokenSymbol];
  if (!token || !address) {
    console.warn('getTokenBalance: Missing token or address', { address, tokenSymbol });
    return 0;
  }

  // If XLM, fetch native balance from Horizon
  if (tokenSymbol === 'XLM') {
    try {
      const freighterOk = await checkFreighter();
      if (!freighterOk) throw new Error('Freighter not available');
      console.log('Fetching XLM balance from Horizon', { address, HORIZON_URL });
      const server = new Server(HORIZON_URL);
      const account = await server.loadAccount(address);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      const value = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
      console.log('XLM balance result', { value, xlmBalance });
      return Number.isFinite(value) ? value : 0;
    } catch (e) {
      console.error('Error fetching XLM balance:', e, { address, HORIZON_URL });
      return 0;
    }
  }

  // For contract tokens (BLEND, USDC, etc.)
  try {
    console.log('Fetching contract token balance', { address, tokenSymbol, contractAddress: token.address, SOROBAN_RPC });
    const contract = new SorobanClient.Contract(token.address);
    const server = new SorobanClient.Server(SOROBAN_RPC, { allowHttp: true });
    const result = await contract.call(
      server,
      'balance',
      [tokenSymbol === 'XLM' ? undefined : address],
      { networkPassphrase: 'Test SDF Network ; September 2015' }
    );
    const decimals = token.decimals || 7;
    const value = Number(result) / Math.pow(10, decimals);
    console.log('Contract token balance result', { value, result });
    return Number.isFinite(value) ? value : 0;
  } catch (e) {
    console.error(`Error fetching ${tokenSymbol} balance:`, e, { address, contractAddress: token.address, SOROBAN_RPC });
    return 0;
  }
};

// Debugging repeated stake attempts
let stakeAttemptCount = 0;
export const debugStakeAttempt = (data) => {
  stakeAttemptCount++;
  console.log(`🔍 DEBUG Stake Attempt #${stakeAttemptCount}:`, data);
  if (stakeAttemptCount > 10) {
    console.warn('Too many stake attempts - check for infinite loops');
  }
};

// Get all token balances for an address
export const getAllBalances = async (address) => {
  const balances = {};
  for (const symbol of Object.keys(TOKENS)) {
    balances[symbol] = await getTokenBalance(address, symbol);
  }
  return balances;
}; 
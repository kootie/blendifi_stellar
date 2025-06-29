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
    address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
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

import { getAssetPrice, RPC_URL } from './contract';
import * as SorobanClient from 'soroban-client';

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
  if (!token || !address) return 0;

  // If XLM, fetch native balance
  if (tokenSymbol === 'XLM') {
    try {
      const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
      const account = await server.getAccount(address);
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
    } catch {
      return 0;
    }
  }

  // For contract tokens, call the token contract's balance method
  try {
    const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
    const result = await server.callContract({
      contractAddress: token.address,
      functionName: 'balance',
      args: [address]
    });
    // Assume result is a string or number
    return Number(result) || 0;
  } catch {
    return 0;
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
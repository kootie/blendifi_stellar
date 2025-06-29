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

// Mock price data (in production, this would come from price feeds)
export const getTokenPrice = (symbol) => {
  const prices = {
    BLEND: 0.15,
    XLM: 0.12,
    USDC: 1.00,
    BTC: 45000
  };
  return prices[symbol] || 0;
};

// Mock balance data (in production, this would come from blockchain)
export const getTokenBalance = async (address, tokenSymbol) => {
  // Placeholder for balance fetching
  const mockBalances = {
    BLEND: 1000,
    XLM: 500,
    USDC: 250,
    BTC: 0.01
  };
  return mockBalances[tokenSymbol] || 0;
};

// Get all token balances for an address
export const getAllBalances = async (address) => {
  const balances = {};
  for (const symbol of Object.keys(TOKENS)) {
    balances[symbol] = await getTokenBalance(address, symbol);
  }
  return balances;
}; 
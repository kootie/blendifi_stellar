import * as SorobanClient from 'soroban-client';

// Contract configuration for Blendifi DeFi MVP
export const CONTRACT_ADDRESS = 'CA26SDP73CGMH5E5HHTHT3DN4YPH4DJUNRBRHPB4ZJTF2DQXDMCXXTZH';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// Stellar SDK configuration
export const stellarConfig = {
  network: 'testnet',
  rpcUrl: RPC_URL,
  passphrase: NETWORK_PASSPHRASE
};

// Generic contract call utility
export async function contractCall(functionName, args, userAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  const account = await server.getAccount(userAddress);

  // args should always be an array now
  if (!Array.isArray(args)) {
    throw new Error('Arguments to contractCall must be an array');
  }

  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(SorobanClient.Operation.invokeHostFunction({
      function: {
        type: 'invokeContract',
        contractAddress: CONTRACT_ADDRESS,
        functionName,
        args
      }
    }))
    .setTimeout(30)
    .build();

  const signedXDR = await window.freighter.signTransaction(tx.toXDR(), {
    network: 'TESTNET'
  });

  const result = await server.sendTransaction(SorobanClient.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE));
  return result;
}

// Updated stakeBlend using explicit argument array
export async function stakeBlend(userAddress, contractAmount) {
  // contractAmount is already a string in smallest unit
  const args = [userAddress, contractAmount];
  console.log('Staking args:', args);
  return await contractCall('stake_blend', args, userAddress);
}

// Real borrow function using Soroban contract
export async function borrowAsset(asset, amount, collateralToken, collateralAmount, userAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  const account = await server.getAccount(userAddress);

  // Prepare contract invocation
  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(SorobanClient.Operation.invokeHostFunction({
      function: {
        type: 'invokeContract',
        contractAddress: CONTRACT_ADDRESS,
        functionName: 'borrow_from_blend',
        args: [userAddress, asset, amount]
      }
    }))
    .setTimeout(30)
    .build();

  // Sign with Freighter
  const signedXDR = await window.freighter.signTransaction(tx.toXDR(), {
    network: 'TESTNET'
  });

  // Submit
  const result = await server.sendTransaction(SorobanClient.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE));
  return result;
}

// Get user position from contract
export async function getUserPosition() {
  // TODO: Replace with real contract call using Soroban simulation or RPC
  // For now, return mock data to prevent errors
  return {
    supplied_assets: {},
    borrowed_assets: {},
    staked_blend: 0,
    rewards_earned: 0,
    health_factor: 1000000000000000000 // 1.0 in wei
  };
}

// Get health status from contract
export async function getHealthStatus() {
  // TODO: Replace with real contract call using Soroban simulation or RPC
  // For now, return null to prevent errors
  return null;
}

// Get asset price from contract
export async function getAssetPrice() {
  // TODO: Replace with real contract call using Soroban simulation or RPC
  // For now, return null to prevent errors
  return null;
}

// Contract interaction helpers
export const buildStakeTransaction = async (amount, userAddress) => {
  // Placeholder for stake transaction building
  // This would interact with the actual Blend protocol contract
  return {
    amount,
    userAddress,
    type: 'stake'
  };
};

export const buildSwapTransaction = async (fromToken, toToken, amount, userAddress) => {
  // Placeholder for swap transaction building
  return {
    fromToken,
    toToken,
    amount,
    userAddress,
    type: 'swap'
  };
};

export const buildBorrowTransaction = async (asset, amount, collateral, userAddress) => {
  // Placeholder for borrow transaction building
  return {
    asset,
    amount,
    collateral,
    userAddress,
    type: 'borrow'
  };
};

export const submitTransaction = async (signedTransaction) => {
  // Placeholder for transaction submission
  // This would submit to the Stellar network
  console.log('Submitting transaction:', signedTransaction);
  return { success: true, hash: 'mock_hash_' + Date.now() };
};

// Supply to Blend (Lending)
export async function supplyToBlend(userAddress, assetAddress, amount, asCollateral) {
  const args = [userAddress, assetAddress, amount, asCollateral];
  return await contractCall('supply_to_blend', args, userAddress);
}

// Borrow from Blend
export async function borrowFromBlend(userAddress, assetAddress, amount) {
  const args = [userAddress, assetAddress, amount];
  return await contractCall('borrow_from_blend', args, userAddress);
}

// Token Swap
export async function swapTokens(userAddress, tokenIn, tokenOut, amountIn, minAmountOut, deadline) {
  const args = [userAddress, tokenIn, tokenOut, amountIn, minAmountOut, deadline];
  return await contractCall('swap_tokens', args, userAddress);
}

export async function claimRewards(userAddress) {
  const args = [userAddress];
  return await contractCall('claim_rewards', args, userAddress);
}

export async function unstakeBlend(userAddress, amount) {
  const args = [userAddress, amount];
  return await contractCall('unstake_blend', args, userAddress);
} 
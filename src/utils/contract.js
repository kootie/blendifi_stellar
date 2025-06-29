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
export async function contractCall(functionName, params, userAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  const account = await server.getAccount(userAddress);

  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(SorobanClient.Operation.invokeHostFunction({
      function: {
        type: 'invokeContract',
        contractAddress: CONTRACT_ADDRESS,
        functionName,
        args: [params]
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

// Updated stakeBlend using contractCall
export async function stakeBlend(userAddress, amount) {
  const params = {
    user: userAddress,
    amount: amount // should be u128 (string or BigInt)
  };
  return await contractCall('stake_blend', params, userAddress);
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
export async function getUserPosition(userAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  
  try {
    // Call the contract's get_user_position function
    const result = await server.callContract({
      contractAddress: CONTRACT_ADDRESS,
      functionName: 'get_user_position',
      args: [userAddress]
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching user position:', error);
    // Return mock data for now
    return {
      supplied_assets: {},
      borrowed_assets: {},
      staked_blend: 0,
      rewards_earned: 0,
      health_factor: 1000000000000000000 // 1.0 in wei
    };
  }
}

// Get health status from contract
export async function getHealthStatus(userAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  
  try {
    const result = await server.callContract({
      contractAddress: CONTRACT_ADDRESS,
      functionName: 'get_health_status',
      args: [userAddress]
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching health status:', error);
    return 0; // Healthy by default
  }
}

// Get asset price from contract
export async function getAssetPrice(assetAddress) {
  const server = new SorobanClient.Server(RPC_URL, { allowHttp: true });
  
  try {
    const result = await server.callContract({
      contractAddress: CONTRACT_ADDRESS,
      functionName: 'get_asset_price',
      args: [assetAddress]
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching asset price:', error);
    return 0;
  }
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
  const params = {
    user: userAddress,
    asset: assetAddress,
    amount: amount, // u128
    as_collateral: asCollateral // boolean
  };
  return await contractCall('supply_to_blend', params, userAddress);
}

// Borrow from Blend
export async function borrowFromBlend(userAddress, assetAddress, amount) {
  const params = {
    user: userAddress,
    asset: assetAddress,
    amount: amount // u128
  };
  return await contractCall('borrow_from_blend', params, userAddress);
}

// Token Swap
export async function swapTokens(userAddress, tokenIn, tokenOut, amountIn, minAmountOut, deadline) {
  const params = {
    user: userAddress,
    token_in: tokenIn,
    token_out: tokenOut,
    amount_in: amountIn, // u128
    min_amount_out: minAmountOut, // u128
    deadline: deadline // u64
  };
  return await contractCall('swap_tokens', params, userAddress);
}

export async function claimRewards(userAddress) {
  const params = { user: userAddress };
  return await contractCall('claim_rewards', params, userAddress);
}

export async function unstakeBlend(userAddress, amount) {
  const params = {
    user: userAddress,
    amount: amount // u128
  };
  return await contractCall('unstake_blend', params, userAddress);
} 
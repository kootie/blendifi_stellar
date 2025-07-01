import * as SorobanClient from 'soroban-client';
import { Server as HorizonServer } from 'stellar-sdk';
import { Server as SorobanServer, Contract, scValToNative, Networks } from 'soroban-client';

// Contract configuration for Blendifi DeFi MVP
export const CONTRACT_ADDRESS = 'CA26SDP73CGMH5E5HHTHT3DN4YPH4DJUNRBRHPB4ZJTF2DQXDMCXXTZH';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC = 'https://soroban-testnet.stellar.org';

// Stellar SDK configuration
export const stellarConfig = {
  network: 'testnet',
  rpcUrl: SOROBAN_RPC,
  passphrase: NETWORK_PASSPHRASE
};

// Generic contract call utility
export async function contractCall(functionName, args, userAddress) {
  const server = new SorobanClient.Server(SOROBAN_RPC, { allowHttp: true });
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
  const server = new SorobanClient.Server(SOROBAN_RPC, { allowHttp: true });
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
  try {
    const server = new SorobanServer(SOROBAN_RPC);
    const contract = new Contract(CONTRACT_ADDRESS);
    // Call the contract's get_user_position method
    const result = await contract.call(
      server,
      'get_user_position',
      [userAddress],
      { networkPassphrase: NETWORK_PASSPHRASE }
    );
    // Assume result is an object with staked_blend and rewards_earned fields (adjust if needed)
    return scValToNative(result);
  } catch (error) {
    console.error('Error fetching user position:', error);
    return {
      supplied_assets: {},
      borrowed_assets: {},
      staked_blend: 0,
      rewards_earned: 0,
      health_factor: 1000000000000000000
    };
  }
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

// Placeholder gas price fetcher for Soroban (replace with real logic if available)
export const getGasPrice = async () => {
  // Soroban does not use EVM gas, so this is a placeholder.
  // If you have a real endpoint, use it here.
  return 0.0001; // Example: 0.0001 BLEND per tx
};

// Placeholder gas estimator for staking (replace with real logic if available)
export const estimateGasForStake = async () => {
  // Soroban does not use EVM gas, so this is a placeholder.
  // If you have a real endpoint, use it here.
  return 1; // Example: 1 unit (so total cost = gasPrice * 1)
};

// Real Soroban fee estimation for staking
export const estimateStakeFee = async (userAddress, amount) => {
  const server = new SorobanClient.Server(SOROBAN_RPC, { allowHttp: true });
  const account = await server.getAccount(userAddress);

  // Build the transaction (do not sign)
  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: '100', // Placeholder, will be replaced by simulation
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(SorobanClient.Operation.invokeHostFunction({
      function: {
        type: 'invokeContract',
        contractAddress: CONTRACT_ADDRESS,
        functionName: 'stake_blend',
        args: [userAddress, amount]
      }
    }))
    .setTimeout(30)
    .build();

  // Simulate the transaction
  const sim = await server.simulateTransaction(tx);

  // The fee is in stroops (1 stroop = 0.0000001 XLM)
  const feeStroops = sim.minResourceFee;
  const feeXLM = feeStroops / 1e7; // 1 XLM = 10^7 stroops

  return { feeStroops, feeXLM };
};

// Classic Stellar (Horizon) operations
export const getAccountInfo = async (publicKey) => {
  const server = new HorizonServer(HORIZON_URL);
  return await server.loadAccount(publicKey);
};

// Soroban contract call (generic)
export const callSorobanContract = async (contractId, method, args = []) => {
  const server = new SorobanServer(SOROBAN_RPC);
  const contract = new Contract(contractId);
  const result = await contract.call(
    server,
    method,
    args,
    { networkPassphrase: NETWORK_PASSPHRASE }
  );
  return scValToNative(result);
}; 
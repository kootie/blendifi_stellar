import { useState, useEffect, useCallback } from 'react';
import {
  isConnected as freighterIsConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress as freighterGetAddress,
  getNetwork,
  getNetworkDetails as freighterGetNetworkDetails,
  signTransaction as freighterSignTransaction,
  addToken as freighterAddToken,
  WatchWalletChanges
} from '@stellar/freighter-api';
import * as SorobanClient from 'soroban-client';
import { HORIZON_URL } from '../utils/contract';

const SOROBAN_RPC = 'https://soroban-testnet.stellar.org'; // TESTNET Soroban RPC endpoint
//const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'; // TESTNET passphrase
const DEFAULT_NETWORK = 'TESTNET';
const DEFAULT_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const useFreighter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState(null);
  const [networkPassphrase, setNetworkPassphrase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kit, setKit] = useState(null);

  // Check if Freighter is installed and connected
  const checkConnection = useCallback(async () => {
    try {
      const connectionResult = await freighterIsConnected();
      return connectionResult.isConnected;
    } catch (err) {
      console.error('Error checking Freighter connection:', err);
      return false;
    }
  }, []);

  // Connect to Freighter wallet
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check if Freighter is connected
      const connected = await checkConnection();
      if (!connected) {
        setError('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
        return false;
      }

      // Check if app is allowed
      const allowedResult = await isAllowed();
      if (!allowedResult.isAllowed) {
        // Request permission
        const setAllowedResult = await setAllowed();
        if (!setAllowedResult.isAllowed) {
          setError('Permission denied. Please allow this app to access Freighter.');
          return false;
        }
      }

      // Request access to get public key
      const accessResult = await requestAccess();
      if (accessResult.error) {
        setError(accessResult.error);
        return false;
      }

      setPublicKey(accessResult.address);

      // Get network information
      const networkResult = await getNetwork();
      console.log('getNetwork result (connect):', networkResult);
      if (!networkResult.error) {
        setNetwork(networkResult.network || DEFAULT_NETWORK);
        setNetworkPassphrase(networkResult.networkPassphrase || DEFAULT_NETWORK_PASSPHRASE);
      } else {
        setNetwork(DEFAULT_NETWORK);
        setNetworkPassphrase(DEFAULT_NETWORK_PASSPHRASE);
      }

      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to connect to Freighter wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setPublicKey(null);
    setNetwork(null);
    setNetworkPassphrase(null);
    setError(null);
  }, []);

  // Sign a transaction
  const signTransaction = useCallback(async (transaction, options = {}) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await freighterSignTransaction(transaction, options);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.signedTxXdr;
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  }, [isConnected]);

  // Get wallet address
  const getAddress = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await freighterGetAddress();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.address;
    } catch (err) {
      throw new Error(`Failed to get address: ${err.message}`);
    }
  }, [isConnected]);

  // Get network details
  const getNetworkDetails = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await freighterGetNetworkDetails();
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      throw new Error(`Failed to get network details: ${err.message}`);
    }
  }, [isConnected]);

  // Add token to wallet
  const addToken = useCallback(async (contractId, networkPassphrase) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await freighterAddToken({ contractId, networkPassphrase });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.contractId;
    } catch (err) {
      throw new Error(`Failed to add token: ${err.message}`);
    }
  }, [isConnected]);

  // Check connection status on mount
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const connected = await checkConnection();
        if (connected) {
          // Check if we have permission
          const allowedResult = await isAllowed();
          if (allowedResult.isAllowed) {
            // Get current address
            const addressResult = await freighterGetAddress();
            if (!addressResult.error) {
              setPublicKey(addressResult.address);
              setIsConnected(true);
              
              // Get network
              const networkResult = await getNetwork();
              console.log('getNetwork result (initializeConnection):', networkResult);
              if (!networkResult.error) {
                setNetwork(networkResult.network || DEFAULT_NETWORK);
                setNetworkPassphrase(networkResult.networkPassphrase || DEFAULT_NETWORK_PASSPHRASE);
              } else {
                setNetwork(DEFAULT_NETWORK);
                setNetworkPassphrase(DEFAULT_NETWORK_PASSPHRASE);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing Freighter connection:', error);
      }
    };

    initializeConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (isConnected && publicKey && network) {
      // Set up the kit object when connected
      const server = new SorobanClient.Server(SOROBAN_RPC, { allowHttp: true });
      setKit({
        server,
        networkPassphrase: NETWORK_PASSPHRASE,
        horizonUrl: HORIZON_URL,
      });
    } else {
      setKit(null);
    }
  }, [isConnected, publicKey, network]);

  return {
    isConnected,
    publicKey,
    network,
    networkPassphrase,
    isLoading,
    error,
    connect,
    disconnect,
    signTransaction,
    getAddress,
    getNetworkDetails,
    addToken,
    checkConnection,
    kit,
  };
}; 
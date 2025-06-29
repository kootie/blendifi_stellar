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

export const useFreighter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      if (!networkResult.error) {
        setNetwork(networkResult.network);
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
              if (!networkResult.error) {
                setNetwork(networkResult.network);
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

  return {
    isConnected,
    publicKey,
    network,
    isLoading,
    error,
    connect,
    disconnect,
    signTransaction,
    getAddress,
    getNetworkDetails,
    addToken,
    checkConnection
  };
}; 
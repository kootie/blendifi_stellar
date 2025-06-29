import { useFreighter } from '../hooks/useFreighter';
import { useState, useEffect } from 'react';

const WalletConnect = () => {
  const {
    isConnected,
    publicKey,
    network,
    isLoading,
    error,
    connect,
    disconnect,
    checkConnection
  } = useFreighter();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Check if Freighter is available
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false);

  useEffect(() => {
    const checkFreighter = async () => {
      const available = await checkConnection();
      setIsFreighterAvailable(available);
    };
    checkFreighter();
  }, [checkConnection]);

  if (!isFreighterAvailable) {
    return (
      <div className="wallet-status wallet-disconnected">
        <span>🔗</span>
        <span>Freighter not installed</span>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-primary"
        >
          Install
        </a>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="wallet-status wallet-connected">
          <span>✅</span>
          <span>{formatAddress(publicKey)}</span>
          <span className="text-sm">({network})</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="btn btn-sm btn-secondary"
          disabled={isLoading}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="wallet-status wallet-disconnected">
        <span>🔌</span>
        <span>Not connected</span>
      </div>
      <button
        onClick={handleConnect}
        className="btn btn-sm btn-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {error && (
        <div className="text-error text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 
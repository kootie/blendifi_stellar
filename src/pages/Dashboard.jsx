import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFreighter } from '../hooks/useFreighter';
import { TOKENS, getAllBalances, getTokenPrice } from '../utils/tokens';
import { getUserPosition, getHealthStatus } from '../utils/contract';

const Dashboard = () => {
  const { isConnected, publicKey } = useFreighter();
  const [balances, setBalances] = useState({});
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [healthStatus, setHealthStatus] = useState(0);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadPortfolio();
      loadContractData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, publicKey]);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const userBalances = await getAllBalances(publicKey);
      setBalances(userBalances);
      
      // Calculate total portfolio value
      let total = 0;
      Object.entries(userBalances).forEach(([symbol, balance]) => {
        const price = getTokenPrice(symbol);
        total += balance * price;
      });
      setPortfolioValue(total);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContractData = async () => {
    try {
      // Get user position from contract
      const position = await getUserPosition(publicKey);
      setUserPosition(position);
      
      // Get health status from contract
      const health = await getHealthStatus(publicKey);
      setHealthStatus(health);
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const getHealthStatusText = (status) => {
    switch (status) {
      case 0: return { text: 'Healthy', class: 'status-success' };
      case 1: return { text: 'Warning', class: 'status-warning' };
      case 2: return { text: 'Critical', class: 'status-error' };
      case 3: return { text: 'Liquidatable', class: 'status-error' };
      default: return { text: 'Unknown', class: 'status-warning' };
    }
  };

  const quickActions = [
    {
      title: 'Stake BLEND',
      description: 'Earn rewards by staking',
      icon: '🪙',
      link: '/stake',
      color: 'text-primary'
    },
    {
      title: 'Swap Tokens',
      description: 'Trade tokens instantly',
      icon: '🔄',
      link: '/swap',
      color: 'text-success'
    },
    {
      title: 'Borrow Assets',
      description: 'Borrow against collateral',
      icon: '💰',
      link: '/borrow',
      color: 'text-warning'
    }
  ];

  const recentTransactions = [
    {
      type: 'stake',
      token: 'BLEND',
      amount: '100',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      type: 'swap',
      token: 'XLM → USDC',
      amount: '50',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      type: 'borrow',
      token: 'USDC',
      amount: '200',
      timestamp: '3 days ago',
      status: 'completed'
    }
  ];

  if (!isConnected) {
    return (
      <div className="text-center">
        <div className="card">
          <h2 className="mb-4">Connect Your Wallet</h2>
          <p className="text-secondary mb-6">
            Please connect your Freighter wallet to view your dashboard.
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  const healthInfo = getHealthStatusText(healthStatus);
  const stakedAmount = userPosition?.staked_blend || 0;
  const rewardsEarned = userPosition?.rewards_earned || 0;
  const borrowedValue = userPosition?.borrowed_assets ? 
    Object.values(userPosition.borrowed_assets).reduce((sum, amount) => sum + amount, 0) : 0;

  return (
    <div className="dashboard">
      {/* Portfolio Overview */}
      <section className="mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Portfolio Overview</h2>
            <button
              onClick={() => { loadPortfolio(); loadContractData(); }}
              className="btn btn-sm btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : '🔄'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                ${portfolioValue.toFixed(2)}
              </div>
              <div className="text-sm text-secondary">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">
                ${(rewardsEarned * getTokenPrice('BLEND')).toFixed(2)}
              </div>
              <div className="text-sm text-secondary">Rewards Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-2">
                ${borrowedValue.toFixed(2)}
              </div>
              <div className="text-sm text-secondary">Borrowed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${healthInfo.class.replace('status-', 'text-')}`}>
                {healthInfo.text}
              </div>
              <div className="text-sm text-secondary">Health Status</div>
            </div>
          </div>

          {/* Contract Position Data */}
          {userPosition && (
            <div className="mb-6">
              <h3 className="mb-4">Contract Positions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <div className="text-lg font-bold text-primary mb-2">
                    {stakedAmount.toFixed(4)} BLEND
                  </div>
                  <div className="text-sm text-secondary">Staked</div>
                </div>
                <div className="card">
                  <div className="text-lg font-bold text-success mb-2">
                    {rewardsEarned.toFixed(4)} BLEND
                  </div>
                  <div className="text-sm text-secondary">Rewards</div>
                </div>
                <div className="card">
                  <div className="text-lg font-bold text-warning mb-2">
                    {borrowedValue.toFixed(4)}
                  </div>
                  <div className="text-sm text-secondary">Borrowed Value</div>
                </div>
              </div>
            </div>
          )}

          {/* Token Balances */}
          <h3 className="mb-4">Your Balances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(balances).map(([symbol, balance]) => {
              const token = TOKENS[symbol];
              const price = getTokenPrice(symbol);
              const value = balance * price;
              
              return (
                <div key={symbol} className="token-item">
                  <div className="token-icon">
                    {token.icon}
                  </div>
                  <div className="token-info">
                    <div className="token-symbol">{token.symbol}</div>
                    <div className="token-name">{token.name}</div>
                  </div>
                  <div className="token-balance">
                    <div className="token-amount">{balance.toFixed(4)}</div>
                    <div className="token-value">${value.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="card hover:shadow-lg transition-all">
              <div className={`text-3xl mb-3 ${action.color}`}>
                {action.icon}
              </div>
              <h3 className="mb-2">{action.title}</h3>
              <p className="text-secondary text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <h2 className="mb-6">Recent Transactions</h2>
        <div className="card">
          <div className="space-y-4">
            {recentTransactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`text-lg ${
                    tx.type === 'stake' ? 'text-primary' :
                    tx.type === 'swap' ? 'text-success' : 'text-warning'
                  }`}>
                    {tx.type === 'stake' ? '🪙' : tx.type === 'swap' ? '🔄' : '💰'}
                  </div>
                  <div>
                    <div className="font-medium">{tx.token}</div>
                    <div className="text-sm text-secondary">{tx.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tx.amount}</div>
                  <div className={`text-xs status status-success`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 
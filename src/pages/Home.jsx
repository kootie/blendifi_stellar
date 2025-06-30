import { Link } from 'react-router-dom';
import { useFreighter } from '../hooks/useFreighter';
import React, { useState } from 'react';
import GlassPanel from '../components/GlassPanel';

const Home = () => {
  const { isConnected } = useFreighter();
  const [showModal, setShowModal] = useState(false);

  const features = [
    {
      icon: '🪙',
      title: 'Stake BLEND',
      description: 'Earn rewards by staking your BLEND tokens in our secure protocol',
      link: '/stake'
    },
    {
      icon: '🔄',
      title: 'Swap Tokens',
      description: 'Trade tokens instantly with competitive rates and low fees',
      link: '/swap'
    },
    {
      icon: '💰',
      title: 'Borrow Assets',
      description: 'Borrow against your collateral with flexible terms',
      link: '/borrow'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.5M', change: '+12.5%' },
    { label: 'Active Users', value: '1,234', change: '+8.2%' },
    { label: 'APY (BLEND)', value: '15.2%', change: '+2.1%' },
    { label: 'Total Transactions', value: '45.2K', change: '+18.7%' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="mb-4">
          Welcome to <span className="text-primary">Blendifi</span>
        </h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          The next generation DeFi platform on Stellar. Stake, swap, and borrow with 
          unprecedented ease and security.
        </p>
        {!isConnected ? (
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="btn btn-lg btn-primary">
              Get Started
            </Link>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-secondary"
            >
              Install Freighter
            </a>
          </div>
        ) : (
          <Link to="/dashboard" className="btn btn-lg btn-primary">
            Go to Dashboard
          </Link>
        )}
      </section>

      {/* Stats Section */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="card text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-secondary mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-success">
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-center mb-8">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="mb-3">{feature.title}</h3>
              <p className="text-secondary mb-4">
                {feature.description}
              </p>
              <Link to={feature.link} className="btn btn-primary">
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="card">
          <h2 className="mb-4">Ready to start your DeFi journey?</h2>
          <p className="text-secondary mb-6">
            Connect your Freighter wallet and start earning rewards today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="btn btn-lg btn-primary">
              Launch App
            </Link>
            <a
              href="https://stellar.org/developers/learn/soroban"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-secondary"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
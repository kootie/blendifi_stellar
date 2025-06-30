import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Stake from './pages/Stake';
import Swap from './pages/Swap';
import Borrow from './pages/Borrow';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/stake', label: 'Stake' },
    { path: '/swap', label: 'Swap' },
    { path: '/borrow', label: 'Borrow' }
  ];

  return (
    <nav className="nav">
      <Link to="/" className="logo" style={{ alignItems: 'center' }}>
        <img src="/blendifi (1).jpg" alt="Blendifi" className="logo-img" style={{ width: 72, height: 72, objectFit: 'contain', background: '#fff', boxShadow: '0 2px 8px #3B82F633' }} />
        <span style={{ color: '#2563EB', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.01em', marginLeft: 16 }}>Blendifi</span>
      </Link>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <WalletConnect />
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <Navigation />
          </div>
        </header>
        
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stake" element={<Stake />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/borrow" element={<Borrow />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;

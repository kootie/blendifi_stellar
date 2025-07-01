import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Stake from './pages/Stake';
import Swap from './pages/Swap';
import Borrow from './pages/Borrow';
import Dashboard from './pages/Dashboard';
import { useFreighter } from './hooks/useFreighter';

const App = () => {
  const { isConnected, connect, disconnect, publicKey } = useFreighter();

  return (
    <Router>
      <div className="min-h-screen bg-surface">
        {/* Top Navigation Bar */}
        <header className="header">
          <div className="container nav">
            <NavLink to="/" className="logo">
              <img src="/blendifi2.jpg" alt="Blendifi" className="logo-img" />
              Blendifi
            </NavLink>
            <nav>
              <ul className="nav-links">
                <li><NavLink to="/stake" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Stake</NavLink></li>
                <li><NavLink to="/swap" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Swap</NavLink></li>
                <li><NavLink to="/borrow" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Borrow</NavLink></li>
                <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink></li>
              </ul>
            </nav>
            <div>
              {isConnected ? (
                <button className="btn btn-secondary wallet-status wallet-connected" onClick={disconnect}>
                  {publicKey.slice(0, 6)}...{publicKey.slice(-4)} (Disconnect)
                </button>
              ) : (
                <button className="btn btn-primary wallet-status wallet-disconnected" onClick={connect}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/stake" element={<Stake />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/borrow" element={<Borrow />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;

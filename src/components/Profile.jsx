import React, { useState } from 'react';

const Profile = ({ address }) => {
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  const short = address.slice(0, 6) + '...' + address.slice(-4);
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '1.5rem 0', justifyContent: 'space-between' }}>
      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>Wallet</div>
      <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-primary)' }}>{short}</div>
      <button className="btn" style={{ padding: '0.5em 1em', fontSize: '0.95rem', background: 'var(--primary)', color: '#fff', borderRadius: 8 }} onClick={handleCopy} aria-label="Copy wallet address">
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default Profile; 
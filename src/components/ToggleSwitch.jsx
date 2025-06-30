import React from 'react';

const ToggleSwitch = ({ checked, onChange, label }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span
      className="toggle-switch"
      data-checked={checked}
      tabIndex={0}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!checked)}
      style={{ outline: 'none' }}
    >
      <span className="toggle-thumb" />
    </span>
  </label>
);

export default ToggleSwitch; 
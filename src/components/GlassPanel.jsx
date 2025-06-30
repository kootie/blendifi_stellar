import React from 'react';

const GlassPanel = ({ children, className = '', style = {} }) => (
  <div className={`glass-panel ${className}`} style={style}>
    {children}
  </div>
);

export default GlassPanel; 
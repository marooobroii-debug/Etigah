import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/logo_black.png"
    alt="Etigah Logo"
    className={className || 'w-16 h-16 mx-auto'}
    style={{ display: 'block' }}
    draggable={false}
  />
);

export default Logo;

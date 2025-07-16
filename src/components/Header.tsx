import React from 'react';

const Header: React.FC = () => (
  <header className="bg-gray-950 border-b border-lime-400 text-yellow-400 p-4 flex items-center justify-between">
    <h1 className="text-2xl font-bold text-lime-400">Crypto Portfolio & Market Assistant</h1>
    <span className="text-sm text-yellow-400">Beta</span>
  </header>
);

export default Header;
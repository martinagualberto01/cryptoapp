import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <aside className="w-56 bg-gray-950 border-r border-lime-400 p-4 flex flex-col gap-4">
      <nav className="flex flex-col gap-2">
        <Link to="/" className={`text-lime-400 hover:text-yellow-400${pathname === '/' ? ' font-bold underline' : ''}`}>Dashboard</Link>
        <Link to="/portfolio" className={`text-lime-400 hover:text-yellow-400${pathname === '/portfolio' ? ' font-bold underline' : ''}`}>Portfólio</Link>
        <Link to="/transacoes" className={`text-lime-400 hover:text-yellow-400${pathname === '/transacoes' ? ' font-bold underline' : ''}`}>Transações</Link>
        <Link to="/alertas" className={`text-lime-400 hover:text-yellow-400${pathname === '/alertas' ? ' font-bold underline' : ''}`}>Alertas</Link>
        <Link to="/sugestoes" className={`text-lime-400 hover:text-yellow-400${pathname === '/sugestoes' ? ' font-bold underline' : ''}`}>Sugestões</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
import React from 'react';

const Sidebar: React.FC = () => (
  <aside className="w-56 bg-gray-950 border-r border-lime-400 p-4 flex flex-col gap-4">
    <nav className="flex flex-col gap-2">
      <a href="#" className="text-lime-400 hover:text-yellow-400">Dashboard</a>
      <a href="#" className="text-lime-400 hover:text-yellow-400">Portfólio</a>
      <a href="#" className="text-lime-400 hover:text-yellow-400">Transações</a>
      <a href="#" className="text-lime-400 hover:text-yellow-400">Alertas</a>
      <a href="#" className="text-lime-400 hover:text-yellow-400">Sugestões</a>
    </nav>
  </aside>
);

export default Sidebar;
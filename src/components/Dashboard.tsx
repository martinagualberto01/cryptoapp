import React from 'react';

const Dashboard: React.FC = () => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold text-lime-400 mb-2">Visão Geral do Portfólio</h2>
    <div className="bg-gray-800 rounded-lg p-4 shadow-md">
      {/* Aqui virão os cards de resumo, gráficos e destaques */}
      <p className="text-gray-300">Resumo do portfólio, gráficos e destaques aparecerão aqui.</p>
    </div>
  </section>
);

export default Dashboard;
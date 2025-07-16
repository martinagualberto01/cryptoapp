import React from 'react';

const AddTransactionModal: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-bold text-lime-400 mb-4">Adicionar Transação</h2>
      <p className="text-gray-300">Formulário de compra/venda aparecerá aqui.</p>
    </div>
  </div>
);

export default AddTransactionModal;
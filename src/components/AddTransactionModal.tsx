import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigate } from 'react-router-dom';
import { buscarMoedasPopulares } from '../services/cryptoApi';

const AddTransactionModal: React.FC = () => {
  const { adicionarTransacao } = usePortfolio();
  const navigate = useNavigate();
  const [moeda, setMoeda] = useState('bitcoin');
  const [tipo, setTipo] = useState<'compra' | 'venda'>('compra');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 16));
  const [erro, setErro] = useState('');
  const [moedasPopulares, setMoedasPopulares] = useState<{ id: string; nome: string; simbolo: string }[]>([]);

  useEffect(() => {
    buscarMoedasPopulares().then(setMoedasPopulares);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!moeda || !quantidade || !preco) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (Number(quantidade) <= 0 || Number(preco) <= 0) {
      setErro('Valores devem ser positivos.');
      return;
    }
    adicionarTransacao({
      id: Date.now().toString(),
      moeda: moeda.toLowerCase(),
      tipo,
      quantidade: Number(quantidade),
      preco: Number(preco),
      data,
    });
    navigate('/portfolio');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-lime-400 mb-4">Adicionar Transação</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-gray-300">
            Moeda:
            <input
              list="moedas-list"
              value={moeda}
              onChange={e => setMoeda(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              placeholder="Digite o id da moeda (ex: bitcoin, ethereum, solana)"
              required
            />
            <datalist id="moedas-list">
              {moedasPopulares.map(m => (
                <option key={m.id} value={m.id}>{m.nome} ({m.simbolo.toUpperCase()})</option>
              ))}
            </datalist>
          </label>
          <label className="text-gray-300">
            Tipo:
            <select value={tipo} onChange={e => setTipo(e.target.value as 'compra' | 'venda')} className="w-full mt-1 p-2 rounded bg-gray-800 text-white">
              <option value="compra">Compra</option>
              <option value="venda">Venda</option>
            </select>
          </label>
          <label className="text-gray-300">
            Quantidade:
            <input type="number" step="any" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-800 text-white" required />
          </label>
          <label className="text-gray-300">
            Preço unitário (USD):
            <input type="number" step="any" value={preco} onChange={e => setPreco(e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-800 text-white" required />
          </label>
          <label className="text-gray-300">
            Data:
            <input type="datetime-local" value={data} onChange={e => setData(e.target.value)} className="w-full mt-1 p-2 rounded bg-gray-800 text-white" required />
          </label>
          {erro && <div className="text-red-400 text-sm">{erro}</div>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-lime-400 text-gray-900 font-bold py-2 rounded hover:bg-lime-300">Salvar</button>
            <button type="button" onClick={() => navigate('/portfolio')} className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
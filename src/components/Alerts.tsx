import React, { useState } from 'react';
import { useAlerts } from '../context/AlertsContext';
import { usePortfolio } from '../context/PortfolioContext';

const tiposAlerta = [
  { value: 'preco', label: 'Preço' },
  { value: 'rsi', label: 'RSI' },
];

const Alerts: React.FC = () => {
  const { alertas, adicionarAlerta } = useAlerts();
  const { transacoes } = usePortfolio();
  const moedasNoPortfolio = Array.from(new Set(transacoes.map(t => t.moeda)));
  const [moeda, setMoeda] = useState(moedasNoPortfolio[0] || 'bitcoin');
  const [tipo, setTipo] = useState<'preco' | 'rsi'>('preco');
  const [condicao, setCondicao] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!moeda || !condicao) {
      setErro('Preencha todos os campos.');
      return;
    }
    adicionarAlerta({
      id: Date.now().toString(),
      moeda,
      tipo,
      condicao,
      ativo: true,
    });
    setCondicao('');
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-yellow-400 mb-2">Alertas</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-end">
          <label className="text-gray-300">
            Moeda:
            <select value={moeda} onChange={e => setMoeda(e.target.value)} className="bg-gray-900 text-white p-2 rounded ml-2">
              {moedasNoPortfolio.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="text-gray-300">
            Tipo:
            <select value={tipo} onChange={e => setTipo(e.target.value as 'preco' | 'rsi')} className="bg-gray-900 text-white p-2 rounded ml-2">
              {tiposAlerta.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="text-gray-300">
            Condição:
            <input type="text" value={condicao} onChange={e => setCondicao(e.target.value)} placeholder={tipo === 'preco' ? 'Ex: > 70000' : 'Ex: < 35'} className="bg-gray-900 text-white p-2 rounded ml-2" />
          </label>
          <button type="submit" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded hover:bg-lime-300">Adicionar</button>
        </form>
        {erro && <div className="text-red-400 text-sm mt-2">{erro}</div>}
      </div>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-yellow-400 mb-2 font-semibold">Meus Alertas</h3>
        {alertas.length === 0 ? (
          <p className="text-gray-400">Nenhum alerta cadastrado.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-yellow-400">
                <th className="py-2">Moeda</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Condição</th>
                <th className="py-2">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {alertas.slice().reverse().map(a => (
                <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td>{a.moeda}</td>
                  <td>{a.tipo === 'preco' ? 'Preço' : 'RSI'}</td>
                  <td>{a.condicao}</td>
                  <td>{a.ativo ? <span className="text-lime-400">Sim</span> : <span className="text-red-400">Não</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Alerts;
import React, { useEffect, useState } from 'react';
import { buscarMoedasPopulares } from '../services/cryptoApi';
import { usePortfolio } from '../context/PortfolioContext';
import CryptoChart from './CryptoChart';

interface Moeda {
  id: string;
  nome: string;
  simbolo: string;
  icone: string;
}

const Portfolio: React.FC = () => {
  const { transacoes } = usePortfolio();
  const [moedasInfo, setMoedasInfo] = useState<Moeda[]>([]);
  const [precos, setPrecos] = useState<Record<string, { usd: number; brl: number }>>({});
  const [loading, setLoading] = useState(true);
  const [moedaSelecionada, setMoedaSelecionada] = useState<string | null>(null);

  // Calcula o saldo de cada moeda baseado nas transações
  const saldoPorMoeda: Record<string, number> = {};
  transacoes.forEach((t) => {
    if (!saldoPorMoeda[t.moeda]) saldoPorMoeda[t.moeda] = 0;
    saldoPorMoeda[t.moeda] += t.tipo === 'compra' ? t.quantidade : -t.quantidade;
  });
  const moedasNoPortfolio = Object.keys(saldoPorMoeda).filter((id) => saldoPorMoeda[id] > 0);

  useEffect(() => {
    const fetchMoedas = async () => {
      setLoading(true);
      const lista = await buscarMoedasPopulares();
      // Filtra apenas as moedas que o usuário possui
      setMoedasInfo(lista.filter((m: Moeda) => moedasNoPortfolio.includes(m.id)));
      const ids = moedasNoPortfolio.join(',');
      if (ids) {
        const precosUSD = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,brl`).then(r => r.json());
        setPrecos(precosUSD);
      }
      setLoading(false);
    };
    fetchMoedas();
    // eslint-disable-next-line
  }, [transacoes]);

  useEffect(() => {
    if (moedasInfo.length > 0 && !moedaSelecionada) {
      setMoedaSelecionada(moedasInfo[0].id);
    }
  }, [moedasInfo, moedaSelecionada]);

  return (
    <section>
      <h2 className="text-xl font-semibold text-lime-400 mb-2">Portfólio</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md">
        {loading ? (
          <p className="text-gray-300">Carregando moedas...</p>
        ) : moedasNoPortfolio.length === 0 ? (
          <p className="text-gray-300">Nenhuma moeda no portfólio. Adicione uma transação!</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-yellow-400">
                <th className="py-2">Moeda</th>
                <th className="py-2">Símbolo</th>
                <th className="py-2">Saldo</th>
                <th className="py-2">Preço (USD)</th>
                <th className="py-2">Preço (BRL)</th>
                <th className="py-2">Valor Total (USD)</th>
                <th className="py-2">Valor Total (BRL)</th>
              </tr>
            </thead>
            <tbody>
              {moedasInfo.map((moeda) => (
                <tr key={moeda.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="flex items-center gap-2 py-2">
                    <img src={moeda.icone} alt={moeda.nome} className="w-6 h-6 rounded-full" />
                    <span>{moeda.nome}</span>
                  </td>
                  <td className="uppercase">{moeda.simbolo}</td>
                  <td>{saldoPorMoeda[moeda.id]}</td>
                  <td>
                    {precos[moeda.id]?.usd ? (
                      <span className="text-lime-400 font-mono">${precos[moeda.id].usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    ) : '--'}
                  </td>
                  <td>
                    {precos[moeda.id]?.brl ? (
                      <span className="text-yellow-400 font-mono">R$ {precos[moeda.id].brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    ) : '--'}
                  </td>
                  <td>
                    {precos[moeda.id]?.usd ? (
                      <span className="text-lime-400 font-mono">${(precos[moeda.id].usd * saldoPorMoeda[moeda.id]).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    ) : '--'}
                  </td>
                  <td>
                    {precos[moeda.id]?.brl ? (
                      <span className="text-yellow-400 font-mono">R$ {(precos[moeda.id].brl * saldoPorMoeda[moeda.id]).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    ) : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {moedasInfo.length > 0 && (
        <div className="my-4">
          <label className="text-gray-300 mr-2">Visualizar gráfico de:</label>
          <select
            value={moedaSelecionada ?? ''}
            onChange={e => setMoedaSelecionada(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            {moedasInfo.map(m => (
              <option key={m.id} value={m.id}>{m.nome} ({m.simbolo.toUpperCase()})</option>
            ))}
          </select>
        </div>
      )}
      {moedaSelecionada && (
        <CryptoChart moedaId={moedaSelecionada} />
      )}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Histórico de Transações</h3>
        {transacoes.length === 0 ? (
          <p className="text-gray-400">Nenhuma transação registrada.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-yellow-400">
                <th className="py-2">Data</th>
                <th className="py-2">Moeda</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Quantidade</th>
                <th className="py-2">Preço (USD)</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.slice().reverse().map((t) => {
                const moeda = moedasInfo.find((m) => m.id === t.moeda);
                return (
                  <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td>{new Date(t.data).toLocaleString('pt-BR')}</td>
                    <td className="flex items-center gap-2 py-2">
                      {moeda && <img src={moeda.icone} alt={moeda.nome} className="w-5 h-5 rounded-full" />} {moeda ? moeda.nome : t.moeda}
                    </td>
                    <td className={t.tipo === 'compra' ? 'text-lime-400' : 'text-red-400'}>{t.tipo === 'compra' ? 'Compra' : 'Venda'}</td>
                    <td>{t.quantidade}</td>
                    <td>${t.preco.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { buscarMoedasPopulares, buscarMoedasPorNome } from '../services/cryptoApi';

function calcularRSI(prices: number[], periodo = 14) {
  let ganhos = 0;
  let perdas = 0;
  for (let i = 1; i <= periodo; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) ganhos += diff;
    else perdas -= diff;
  }
  let rsiArray = [];
  for (let i = periodo; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      ganhos = (ganhos * (periodo - 1) + diff) / periodo;
      perdas = (perdas * (periodo - 1)) / periodo;
    } else {
      ganhos = (ganhos * (periodo - 1)) / periodo;
      perdas = (perdas * (periodo - 1) - diff) / periodo;
    }
    const rs = ganhos / (perdas || 1e-10);
    rsiArray.push(100 - 100 / (1 + rs));
  }
  return rsiArray;
}

const DayTradingSuggestions: React.FC = () => {
  const { transacoes } = usePortfolio();
  const moedasNoPortfolio = Array.from(new Set(transacoes.map(t => t.moeda)));
  const [sugestoes, setSugestoes] = useState<Array<{ moeda: string; rsi: number; preco: number; zona: string; icone?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [icones, setIcones] = useState<Record<string, string>>({});

  useEffect(() => {
    if (moedasNoPortfolio.length === 0) return;
    setLoading(true);
    Promise.all(
      moedasNoPortfolio.map(async (moedaId) => {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${moedaId}/market_chart?vs_currency=usd&days=90&interval=daily`);
        const data = await res.json();
        const priceArr = data.prices.map((p: any) => p[1]);
        const rsiArr = calcularRSI(priceArr);
        const rsiAtual = rsiArr[rsiArr.length - 1];
        const precoAtual = priceArr[priceArr.length - 1];
        // Preço mínimo dos últimos 90 dias
        const precoMin = Math.min(...priceArr);
        let zona = 'Neutra';
        if (rsiAtual < 35 && precoAtual <= precoMin * 1.15) {
          zona = 'Ótima zona de entrada';
        } else if (rsiAtual < 35) {
          zona = 'Possível entrada (RSI baixo)';
        } else if (rsiAtual > 70) {
          zona = 'Sobrecompra (cuidado)';
        }
        return { moeda: moedaId, rsi: rsiAtual, preco: precoAtual, zona };
      })
    ).then(async (sugs) => {
      // Buscar ícones
      const lista = await buscarMoedasPopulares();
      const faltantes = moedasNoPortfolio.filter(id => !lista.some(m => m.id === id));
      let extras: any[] = [];
      if (faltantes.length > 0) {
        const promises = faltantes.map(async id => {
          const res = await buscarMoedasPorNome(id);
          return res.find((m: any) => m.id === id);
        });
        extras = (await Promise.all(promises)).filter(Boolean);
      }
      const iconesObj: Record<string, string> = {};
      [...lista, ...extras].forEach(m => { if (m.icone) iconesObj[m.id] = m.icone; });
      setIcones(iconesObj);
      setSugestoes(sugs);
      setLoading(false);
    });
  }, [transacoes]);

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-yellow-400 mb-2">Sugestões Inteligentes</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md overflow-x-auto">
        {loading ? (
          <p className="text-gray-300">Analisando moedas...</p>
        ) : sugestoes.length === 0 ? (
          <p className="text-gray-300">Nenhuma moeda para sugerir.</p>
        ) : (
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="text-yellow-400">
                <th className="py-2">Moeda</th>
                <th className="py-2">RSI</th>
                <th className="py-2">Preço (USD)</th>
                <th className="py-2">Sugestão</th>
              </tr>
            </thead>
            <tbody>
              {sugestoes.map(s => (
                <tr key={s.moeda} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="flex items-center gap-2 py-2">{icones[s.moeda] && <img src={icones[s.moeda]} alt={s.moeda} className="w-5 h-5 rounded-full" />} {s.moeda.toUpperCase()}</td>
                  <td>{s.rsi ? s.rsi.toFixed(2) : '--'}</td>
                  <td>${s.preco ? s.preco.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '--'}</td>
                  <td className={s.zona.includes('Ótima') ? 'text-lime-400 font-bold' : s.zona.includes('Sobrecompra') ? 'text-red-400 font-bold' : 'text-white'}>{s.zona}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default DayTradingSuggestions;
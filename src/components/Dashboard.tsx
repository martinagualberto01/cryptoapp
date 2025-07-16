import React, { useEffect, useState } from 'react';
import { buscarMoedasPopulares } from '../services/cryptoApi';
import { usePortfolio } from '../context/PortfolioContext';

interface Moeda {
  id: string;
  nome: string;
  simbolo: string;
  icone: string;
}

const Dashboard: React.FC = () => {
  const { transacoes } = usePortfolio();
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [precos, setPrecos] = useState<Record<string, { usd: number; brl: number }>>({});
  const [loading, setLoading] = useState(true);

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
      setMoedas(lista);
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

  // Cálculo do saldo total
  const saldoUSD = moedasNoPortfolio.reduce((acc, id) => acc + (precos[id]?.usd || 0) * saldoPorMoeda[id], 0);
  const saldoBRL = moedasNoPortfolio.reduce((acc, id) => acc + (precos[id]?.brl || 0) * saldoPorMoeda[id], 0);

  // Cálculo do PnL não realizado (lucro/prejuízo)
  let pnlUSD = 0;
  moedasNoPortfolio.forEach((id) => {
    // Filtra transações de compra e venda dessa moeda
    const transacoesMoeda = transacoes.filter((t) => t.moeda === id);
    let quantidadeTotal = 0;
    let custoTotal = 0;
    transacoesMoeda.forEach((t) => {
      if (t.tipo === 'compra') {
        quantidadeTotal += t.quantidade;
        custoTotal += t.quantidade * t.preco;
      } else {
        quantidadeTotal -= t.quantidade;
        custoTotal -= t.quantidade * (custoTotal / (quantidadeTotal + t.quantidade));
      }
    });
    const precoMedio = quantidadeTotal > 0 ? custoTotal / quantidadeTotal : 0;
    const valorAtual = (precos[id]?.usd || 0) * saldoPorMoeda[id];
    const valorPago = precoMedio * saldoPorMoeda[id];
    pnlUSD += valorAtual - valorPago;
  });

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-lime-400 mb-2">Visão Geral do Portfólio</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <span className="block text-gray-300">Saldo Total Estimado (USD)</span>
            <span className="text-2xl font-bold text-lime-400">{loading ? '...' : `$${saldoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
          </div>
          <div className="mb-4">
            <span className="block text-gray-300">Saldo Total Estimado (BRL)</span>
            <span className="text-2xl font-bold text-yellow-400">{loading ? '...' : `R$ ${saldoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</span>
          </div>
          <div className="mb-4">
            <span className="block text-gray-300">PnL (Lucro/Prejuízo Não Realizado)</span>
            <span className={pnlUSD > 0 ? 'text-lime-400 text-lg font-bold' : pnlUSD < 0 ? 'text-red-400 text-lg font-bold' : 'text-white text-lg font-bold'}>
              {loading ? '...' : `${pnlUSD > 0 ? '+' : ''}$${pnlUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {/* Placeholder para gráfico do portfólio */}
          <div className="w-full h-40 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">
            Gráfico do portfólio (em breve)
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
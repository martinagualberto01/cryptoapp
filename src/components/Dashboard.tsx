import React, { useEffect, useState } from 'react';
import { buscarMoedasPopulares } from '../services/cryptoApi';

interface Moeda {
  id: string;
  nome: string;
  simbolo: string;
  icone: string;
}

const Dashboard: React.FC = () => {
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [precos, setPrecos] = useState<Record<string, { usd: number; brl: number }>>({});
  const [loading, setLoading] = useState(true);

  // Simulação de portfólio: 0.5 BTC, 2 ETH, 1000 USDT
  const portfolioSimulado = [
    { id: 'bitcoin', quantidade: 0.5 },
    { id: 'ethereum', quantidade: 2 },
    { id: 'tether', quantidade: 1000 },
  ];

  useEffect(() => {
    const fetchMoedas = async () => {
      setLoading(true);
      const lista = await buscarMoedasPopulares();
      setMoedas(lista);
      const ids = lista.map((m: Moeda) => m.id).join(',');
      const precosUSD = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,brl`).then(r => r.json());
      setPrecos(precosUSD);
      setLoading(false);
    };
    fetchMoedas();
  }, []);

  // Cálculo do saldo total
  const saldoUSD = portfolioSimulado.reduce((acc, ativo) => acc + (precos[ativo.id]?.usd || 0) * ativo.quantidade, 0);
  const saldoBRL = portfolioSimulado.reduce((acc, ativo) => acc + (precos[ativo.id]?.brl || 0) * ativo.quantidade, 0);

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
            <span className="text-lg font-bold text-white">(em breve)</span>
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
import React, { useEffect, useState } from 'react';
import { buscarMoedasPopulares, buscarPreco } from '../services/cryptoApi';

interface Moeda {
  id: string;
  nome: string;
  simbolo: string;
  icone: string;
}

const Portfolio: React.FC = () => {
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [precos, setPrecos] = useState<Record<string, { usd: number; brl: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoedas = async () => {
      setLoading(true);
      const lista = await buscarMoedasPopulares();
      setMoedas(lista);
      // Buscar preços em lote
      const ids = lista.map((m: Moeda) => m.id).join(',');
      const precosUSD = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,brl`).then(r => r.json());
      setPrecos(precosUSD);
      setLoading(false);
    };
    fetchMoedas();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold text-lime-400 mb-2">Portfólio</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-md">
        {loading ? (
          <p className="text-gray-300">Carregando moedas...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-yellow-400">
                <th className="py-2">Moeda</th>
                <th className="py-2">Símbolo</th>
                <th className="py-2">Preço (USD)</th>
                <th className="py-2">Preço (BRL)</th>
              </tr>
            </thead>
            <tbody>
              {moedas.map((moeda) => (
                <tr key={moeda.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="flex items-center gap-2 py-2">
                    <img src={moeda.icone} alt={moeda.nome} className="w-6 h-6 rounded-full" />
                    <span>{moeda.nome}</span>
                  </td>
                  <td className="uppercase">{moeda.simbolo}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
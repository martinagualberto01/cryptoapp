import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface Props {
  moedaId: string;
}

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

const CryptoChart: React.FC<Props> = ({ moedaId }) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [rsi, setRsi] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${moedaId}/market_chart?vs_currency=usd&days=30&interval=daily`
      );
      const data = await res.json();
      const priceArr = data.prices.map((p: any) => p[1]);
      setLabels(data.prices.map((p: any) => new Date(p[0]).toLocaleDateString('pt-BR')));
      setPrices(priceArr);
      setRsi(calcularRSI(priceArr));
      setLoading(false);
    };
    fetchData();
  }, [moedaId]);

  if (loading) return <div className="text-gray-300">Carregando gráfico...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md mt-4">
      <h3 className="text-md font-semibold text-lime-400 mb-2">Gráfico de Preço (30 dias) & RSI</h3>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Preço (USD)',
              data: prices,
              borderColor: '#a3e635',
              backgroundColor: 'rgba(163,230,53,0.1)',
              yAxisID: 'y',
            },
            {
              label: 'RSI',
              data: [ ...Array(prices.length - rsi.length).fill(null), ...rsi ],
              borderColor: '#fde047',
              backgroundColor: 'rgba(253,224,71,0.1)',
              yAxisID: 'y1',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: '#fff' } },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              ticks: { color: '#a3e635' },
              title: { display: true, text: 'Preço (USD)', color: '#a3e635' },
            },
            y1: {
              type: 'linear',
              position: 'right',
              min: 0,
              max: 100,
              grid: { drawOnChartArea: false },
              ticks: { color: '#fde047' },
              title: { display: true, text: 'RSI', color: '#fde047' },
            },
            x: {
              ticks: { color: '#fff' },
            },
          },
        }}
      />
    </div>
  );
};

export default CryptoChart;
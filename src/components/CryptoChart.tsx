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

function calcularMACD(prices: number[], short = 12, long = 26, signal = 9) {
  function ema(prices: number[], period: number) {
    const k = 2 / (period + 1);
    let emaArray = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      emaArray.push(prices[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }
  const emaShort = ema(prices, short);
  const emaLong = ema(prices, long);
  const macd = emaShort.map((v, i) => v - emaLong[i]);
  const macdSignal = ema(macd.slice(long - 1), signal);
  const macdHist = macd.slice(long - 1).map((v, i) => v - macdSignal[i]);
  return { macd: macd.slice(long - 1), signal: macdSignal, hist: macdHist };
}

const CryptoChart: React.FC<Props> = ({ moedaId }) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [rsi, setRsi] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [macd, setMacd] = useState<{ macd: number[]; signal: number[]; hist: number[] } | null>(null);

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
      setMacd(calcularMACD(priceArr));
      setLoading(false);
    };
    fetchData();
  }, [moedaId]);

  if (loading) return <div className="text-gray-300">Carregando gráfico...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md mt-4">
      <h3 className="text-md font-semibold text-lime-400 mb-2">Gráfico de Preço (30 dias) & RSI & MACD</h3>
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
            macd && {
              label: 'MACD',
              data: [ ...Array(prices.length - (macd.macd.length + 25)).fill(null), ...macd.macd ],
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56,189,248,0.1)',
              yAxisID: 'y2',
              pointRadius: 0,
              borderWidth: 2,
            },
            macd && {
              label: 'MACD Signal',
              data: [ ...Array(prices.length - (macd.signal.length + 25)).fill(null), ...macd.signal ],
              borderColor: '#f472b6',
              backgroundColor: 'rgba(244,114,182,0.1)',
              yAxisID: 'y2',
              pointRadius: 0,
              borderDash: [4, 4],
              borderWidth: 2,
            },
            macd && {
              type: 'bar',
              label: 'MACD Hist',
              data: [ ...Array(prices.length - (macd.hist.length + 25)).fill(null), ...macd.hist ],
              backgroundColor: macd.hist.map(v => v > 0 ? 'rgba(163,230,53,0.5)' : 'rgba(244,114,182,0.5)'),
              yAxisID: 'y2',
              borderWidth: 0,
              barPercentage: 0.7,
            },
          ].filter(Boolean),
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
            y2: {
              type: 'linear',
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#38bdf8' },
              title: { display: true, text: 'MACD', color: '#38bdf8' },
              offset: true,
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
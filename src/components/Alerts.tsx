import React, { useState, useEffect } from 'react';
import { useAlerts } from '../context/AlertsContext';
import { usePortfolio } from '../context/PortfolioContext';
import { solicitarPermissaoNotificacao, enviarNotificacao } from '../services/notificationService';
import CryptoChart from './CryptoChart';
import { buscarMoedasPopulares, buscarMoedasPorNome } from '../services/cryptoApi';

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
  const [icones, setIcones] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIcones = async () => {
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
    };
    fetchIcones();
    // eslint-disable-next-line
  }, [moedasNoPortfolio]);

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

  React.useEffect(() => {
    solicitarPermissaoNotificacao();
    if (alertas.length === 0) return;
    const interval = setInterval(async () => {
      for (const alerta of alertas) {
        if (!alerta.ativo) continue;
        // Buscar preço atual
        if (alerta.tipo === 'preco') {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${alerta.moeda}&vs_currencies=usd`);
          const data = await res.json();
          const precoAtual = data[alerta.moeda]?.usd;
          if (precoAtual !== undefined) {
            try {
              // Exemplo: > 70000 ou < 35000
              // eslint-disable-next-line no-eval
              if (eval(`${precoAtual} ${alerta.condicao}`)) {
                enviarNotificacao('Alerta de Preço', `A moeda ${alerta.moeda} atingiu a condição: ${precoAtual} ${alerta.condicao}`);
                alerta.ativo = false;
              }
            } catch {}
          }
        }
        // Buscar RSI atual
        if (alerta.tipo === 'rsi') {
          const res = await fetch(`https://api.coingecko.com/api/v3/coins/${alerta.moeda}/market_chart?vs_currency=usd&days=30&interval=daily`);
          const data = await res.json();
          const priceArr = data.prices.map((p: any) => p[1]);
          const rsi = calcularRSI(priceArr);
          const rsiAtual = rsi[rsi.length - 1];
          if (rsiAtual !== undefined) {
            try {
              // Exemplo: < 35 ou > 70
              // eslint-disable-next-line no-eval
              if (eval(`${rsiAtual} ${alerta.condicao}`)) {
                enviarNotificacao('Alerta de RSI', `A moeda ${alerta.moeda} atingiu RSI: ${rsiAtual.toFixed(2)} ${alerta.condicao}`);
                alerta.ativo = false;
              }
            } catch {}
          }
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [alertas]);

  React.useEffect(() => {
    // Cria alertas automáticos de RSI para cada moeda do portfólio se não existirem
    moedasNoPortfolio.forEach((moedaId) => {
      if (!alertas.some(a => a.moeda === moedaId && a.tipo === 'rsi' && a.condicao === '< 35')) {
        adicionarAlerta({
          id: Date.now().toString() + moedaId + 'rsi35',
          moeda: moedaId,
          tipo: 'rsi',
          condicao: '< 35',
          ativo: true,
        });
      }
      if (!alertas.some(a => a.moeda === moedaId && a.tipo === 'rsi' && a.condicao === '> 70')) {
        adicionarAlerta({
          id: Date.now().toString() + moedaId + 'rsi70',
          moeda: moedaId,
          tipo: 'rsi',
          condicao: '> 70',
          ativo: true,
        });
      }
    });
    // Função para enviar relatório diário
    const enviarRelatorio = async () => {
      if (moedasNoPortfolio.length === 0) return;
      let relatorio = 'Relatório do Portfólio:\n';
      for (const moedaId of moedasNoPortfolio) {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${moedaId}/market_chart?vs_currency=usd&days=30&interval=daily`);
        const data = await res.json();
        const priceArr = data.prices.map((p: any) => p[1]);
        const precoAtual = priceArr[priceArr.length - 1];
        const rsi = calcularRSI(priceArr);
        const rsiAtual = rsi[rsi.length - 1];
        relatorio += `\n${moedaId.toUpperCase()}: $${precoAtual?.toLocaleString('en-US', { minimumFractionDigits: 2 })} | RSI: ${rsiAtual ? rsiAtual.toFixed(2) : '--'}`;
      }
      enviarNotificacao('Relatório Diário', relatorio);
    };
    // Função para calcular o tempo até o próximo horário alvo
    function msAteProximaHora(horas: number[]) {
      const agora = new Date();
      const proxima = new Date(agora);
      for (let h of horas) {
        proxima.setHours(h, 0, 0, 0);
        if (proxima > agora) return proxima.getTime() - agora.getTime();
      }
      // Se já passou de todas, agenda para o primeiro horário do dia seguinte
      proxima.setDate(proxima.getDate() + 1);
      proxima.setHours(horas[0], 0, 0, 0);
      return proxima.getTime() - agora.getTime();
    }
    // Agendamento dos relatórios
    let timeout: NodeJS.Timeout;
    function agendar() {
      const ms = msAteProximaHora([9, 13, 21]);
      timeout = setTimeout(async () => {
        await enviarRelatorio();
        agendar();
      }, ms);
    }
    agendar();
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [moedasNoPortfolio]);

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
      <div className="bg-gray-800 rounded-lg p-4 shadow-md overflow-x-auto">
        <h3 className="text-yellow-400 mb-2 font-semibold">Meus Alertas</h3>
        {alertas.length === 0 ? (
          <p className="text-gray-400">Nenhum alerta cadastrado.</p>
        ) : (
          <table className="w-full min-w-[400px] text-left">
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
                  <td className="flex items-center gap-2 py-2">{icones[a.moeda] && <img src={icones[a.moeda]} alt={a.moeda} className="w-5 h-5 rounded-full" />} {a.moeda}</td>
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
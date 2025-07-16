import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigate } from 'react-router-dom';
import { buscarMoedasPopulares, buscarMoedasPorNome } from '../services/cryptoApi';

const AddTransactionModal: React.FC = () => {
  const { adicionarTransacao } = usePortfolio();
  const navigate = useNavigate();
  const [moeda, setMoeda] = useState('bitcoin');
  const [tipo, setTipo] = useState<'compra' | 'venda'>('compra');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 16));
  const [erro, setErro] = useState('');
  const [moedasPopulares, setMoedasPopulares] = useState<{ id: string; nome: string; simbolo: string; icone?: string }[]>([]);
  const [sugestoes, setSugestoes] = useState<{ id: string; nome: string; simbolo: string; icone?: string }[]>([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const sugestoesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buscarMoedasPopulares().then(setMoedasPopulares);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (moeda.length > 1) {
        setLoadingSugestoes(true);
        buscarMoedasPorNome(moeda).then(res => {
          setSugestoes(res);
          setLoadingSugestoes(false);
        });
      } else {
        setSugestoes([]);
        setLoadingSugestoes(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [moeda]);

  useEffect(() => {
    if (showSugestoes && sugestoesRef.current) {
      const el = sugestoesRef.current.querySelector('.highlighted') as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, showSugestoes]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    // Validação: verifica se o id da moeda existe na CoinGecko
    let moedaValida = false;
    if (moeda.length > 1) {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${moeda.toLowerCase()}`);
      moedaValida = res.ok;
    }
    if (!moedaValida) {
      setErro('Moeda não encontrada na CoinGecko. Verifique o id.');
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

  const opcoes = moeda.length > 1 && sugestoes.length > 0 ? sugestoes : moedasPopulares;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoeda(e.target.value);
    setShowSugestoes(true);
    setHighlighted(0);
  };

  const handleSelect = (m: { id: string }) => {
    setMoeda(m.id);
    setShowSugestoes(false);
    setHighlighted(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSugestoes || opcoes.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, opcoes.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (opcoes[highlighted]) {
        handleSelect(opcoes[highlighted]);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      setShowSugestoes(false);
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !sugestoesRef.current?.contains(e.target as Node)
      ) {
        setShowSugestoes(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-lime-400 mb-4">Adicionar Transação</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-gray-300 relative">
            Moeda:
            <input
              ref={inputRef}
              value={moeda}
              onChange={handleInput}
              onFocus={() => setShowSugestoes(true)}
              onKeyDown={handleKeyDown}
              className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              placeholder="Digite o id, nome ou símbolo da moeda"
              required
              autoFocus
              autoComplete="off"
            />
            {showSugestoes && opcoes.length > 0 && (
              <div
                ref={sugestoesRef}
                className="absolute z-50 left-0 right-0 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-56 overflow-y-auto mt-1"
              >
                {opcoes.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800 ${i === highlighted ? 'bg-gray-800 highlighted' : ''}`}
                    onMouseDown={() => handleSelect(m)}
                  >
                    {m.icone && <img src={m.icone} alt={m.nome} className="w-5 h-5 rounded-full" />}
                    <span className="font-semibold text-lime-400">{m.nome}</span>
                    <span className="text-xs text-gray-400">({m.simbolo.toUpperCase()})</span>
                    <span className="text-xs text-gray-500 ml-auto">{m.id}</span>
                  </div>
                ))}
              </div>
            )}
            {loadingSugestoes && <span className="text-xs text-gray-400 ml-2">Buscando moedas...</span>}
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
        <div className="mt-2 text-xs text-gray-400">
          Dica: O <b>id</b> da moeda é o mesmo usado na CoinGecko (ex: <b>bitcoin</b>, <b>ethereum</b>, <b>solana</b>, <b>pepe</b>, etc).
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
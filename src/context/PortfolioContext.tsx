import React, { createContext, useContext, useState } from 'react';

interface Transacao {
  id: string;
  moeda: string;
  tipo: 'compra' | 'venda';
  quantidade: number;
  preco: number;
  data: string;
}

interface PortfolioContextProps {
  transacoes: Transacao[];
  adicionarTransacao: (t: Transacao) => void;
}

const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const adicionarTransacao = (t: Transacao) => {
    setTransacoes((prev) => [...prev, t]);
  };

  return (
    <PortfolioContext.Provider value={{ transacoes, adicionarTransacao }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio deve ser usado dentro de PortfolioProvider');
  return context;
};
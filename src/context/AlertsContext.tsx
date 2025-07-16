import React, { createContext, useContext, useState } from 'react';

interface Alerta {
  id: string;
  moeda: string;
  tipo: 'preco' | 'rsi' | 'relatorio';
  condicao: string;
  ativo: boolean;
}

interface AlertsContextProps {
  alertas: Alerta[];
  adicionarAlerta: (a: Alerta) => void;
}

const AlertsContext = createContext<AlertsContextProps | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const adicionarAlerta = (a: Alerta) => {
    setAlertas((prev) => [...prev, a]);
  };

  return (
    <AlertsContext.Provider value={{ alertas, adicionarAlerta }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) throw new Error('useAlerts deve ser usado dentro de AlertsProvider');
  return context;
};
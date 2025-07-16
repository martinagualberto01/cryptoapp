import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import AddTransactionModal from './components/AddTransactionModal';
import Alerts from './components/Alerts';
import DayTradingSuggestions from './components/DayTradingSuggestions';
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/transacoes" element={<AddTransactionModal />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/sugestoes" element={<DayTradingSuggestions />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
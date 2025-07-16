import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <Dashboard />
          <Alerts />
        </main>
      </div>
    </div>
  );
};

export default App;
import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

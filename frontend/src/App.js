import './App.css';
import Dashboard from './pages/Dashboard';
import { useState } from 'react';

function App() {
  const [fontSize, setFontSize] = useState(20);

  return (
    <div className="App app-surface">
      <Dashboard />
    </div>
  );
}

export default App;

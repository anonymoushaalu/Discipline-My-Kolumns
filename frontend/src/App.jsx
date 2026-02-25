import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import RulesPage from './pages/RulesPage';
import QuarantinePage from './pages/QuarantinePage';
import LogsPage from './pages/LogsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/quarantine" element={<QuarantinePage />} />
        <Route path="/logs/:jobId" element={<LogsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

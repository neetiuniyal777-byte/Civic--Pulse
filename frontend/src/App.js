import './App.css';
import LandingPage from './components/Landingpage';
import AuthPage from './components/AuthPage';
import CommunityFeed from './components/CommunityFeed';
import AdoptedProblems from './components/AdoptedProblems';
import Petition from './components/Petition';
import Navbar from './components/Navbar';
import GovDashboard from './components/GovDashboard';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  return (
    <div className="App flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/community" element={<CommunityFeed type="unresolved" />} />
          <Route path="/community/solved" element={<CommunityFeed type="solved" />} />
          <Route path="/community/petitions" element={<Petition />} />
          <Route path="/community/adopted" element={<AdoptedProblems />} />
          <Route path="/gov/dashboard" element={<GovDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

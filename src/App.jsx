import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RateProvider } from './context/RateContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FooterBanner from './components/FooterBanner';
import RatesPage from './pages/RatesPage';
import AlertsPage from './pages/AlertsPage';
import VideosPage from './pages/VideosPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <RateProvider>
      <Router>
        <main
          className="min-h-screen Selection:bg-gold-400 Selection:text-magenta-800 relative bg-soft-pink pb-10"
          style={{
            backgroundImage: 'url("/Untitled%20design%20(10).png")',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
        >
          <Navbar />

          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>

          <FooterBanner />
        </main>
      </Router>
    </RateProvider>
  );
}

export default App;

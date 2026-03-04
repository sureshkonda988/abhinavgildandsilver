import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { RateProvider } from './context/RateContext';
import Navbar from './components/Navbar';
import { motion } from 'framer-motion';
import SpotBar from './components/SpotBar';
import Ticker from './components/Ticker';
import Hero from './components/Hero';
import RatesPage from './pages/RatesPage';
import AlertsPage from './pages/AlertsPage';
import VideosPage from './pages/VideosPage';
import AdminPage from './pages/AdminPage';

const AppLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  return (
    <main
      className="min-h-screen Selection:bg-gold-400 Selection:text-magenta-800 relative bg-soft-pink pb-10"
      style={!isHomePage && !isAdminPage ? {
        backgroundImage: location.pathname === '/alerts'
          ? 'url("/WhatsApp Image 2026-02-20 at 9.30.40 AM.jpeg")'
          : location.pathname === '/videos'
            ? 'url("/Untitled design (10).png")'
            : 'url("/Untitled design (14).png")',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      } : {}}
    >
      <Navbar />

      {/* Global Header Section - Appears on every page except Admin */}
      {!isAdminPage && (
        <section className="relative w-full overflow-hidden bg-transparent">
          <motion.img
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={isHomePage ? "/Untitled design (19).png" : "/ChatGPT Image Mar 2, 2026, 03_05_58 PM.png"}
            alt="Abhinav Gold & Silver Header"
            className="w-full h-auto min-h-[120px] md:h-auto object-contain md:object-cover object-center block"
          />

          {/* Overlaid Spot Rates Bar */}
          <div className="absolute top-[60%] md:top-[60%] lg:top-[60%] left-0 w-full z-20">
            <SpotBar />
          </div>
        </section>
      )}

      {/* Global Scrolling Ticker */}
      <Ticker />

      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
  );
};

function App() {
  return (
    <RateProvider>
      <Router>
        <AppLayout />
      </Router>
    </RateProvider>
  );
}

export default App;

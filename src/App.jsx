import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { RateProvider } from './context/RateContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import { motion } from 'framer-motion';
import { MessageCircle, Bell } from 'lucide-react';
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
      className="min-h-screen Selection:bg-magenta-100 Selection:text-magenta-900 relative bg-[#fafafb]"
      style={!isAdminPage ? {
        backgroundImage: isHomePage
          ? 'url("/Untitled design (2).jpg")'
          : location.pathname === '/alerts'
            ? 'url("/fe4171046d7ee1ab9220734db89e8859.jpg")'
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
            src={isHomePage ? "/Untitled design (19).png" : "/Untitled design (21).png"}
            alt="Abhinav Gold & Silver Header"
            className="w-full h-auto min-h-[120px] md:h-auto object-contain md:object-cover object-center block"
          />

          {/* Overlaid Quick Icons - Mobile Only Right Side */}
          {isHomePage && (
            <div className="absolute top-[2%] right-10 z-20 flex md:hidden items-center gap-1.5">
              <a
                href="https://wa.me/919848012345"
                target="_blank"
                className="p-1.5 bg-green-500/90 text-white rounded-lg hover:bg-green-600 transition-all shadow-md flex items-center justify-center"
              >
                <MessageCircle size={18} />
              </a>
              <button className="p-1.5 bg-[#FFD700]/90 text-slate-900 rounded-lg hover:bg-[#FFD700] transition-all shadow-md flex items-center justify-center">
                <Bell size={18} />
              </button>
            </div>
          )}

          {/* Overlaid Spot Rates Bar - Home page only */}
          {isHomePage && (
            <div className="absolute bottom-[5%] md:bottom-[10%] left-0 w-full z-20 flex justify-end px-1 md:px-0">
              <SpotBar />
            </div>
          )}
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

      {/* Bottom Footer Navigation — hidden on Admin, Mobile Only */}
      {!isAdminPage && <BottomNav />}

      {/* Desktop Footer — hidden on Admin, Desktop Only */}
      {!isAdminPage && <Footer />}
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

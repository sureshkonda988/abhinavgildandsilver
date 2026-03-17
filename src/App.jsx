import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { RateProvider, useRates } from './context/RateContext';
import Navigation from './components/Navigation';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { Loader2 } from 'lucide-react';
import MusicPlayer from './components/MusicPlayer';

const Preloader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
    <motion.img
      src="/Untitled design (31).png"
      alt="Abhinav Loading"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="max-w-[80%] max-h-[80%] object-contain"
    />
  </div>
);

const useImagePreloader = (imageList) => {
  const [imagesPreloaded, setImagesPreloaded] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const promises = imageList.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one fails
      });
    });

    Promise.all(promises).then(() => {
      if (isMounted) setImagesPreloaded(true);
    });

    return () => { isMounted = false; };
  }, [imageList]);

  return imagesPreloaded;
};

const AppLayout = () => {
  const { isMusicEnabled } = useRates();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  // Critical images to preload based on viewport
  const criticalImages = React.useMemo(() => {
    const images = ['/Untitled design (31).png'];
    if (isHomePage) {
      images.push('/Untitled design (41).png');
      images.push('/Untitled design (23).jpg');
      images.push('/Abhinav web.psd.jpg');
      images.push('/Untitled design (25).png');
      images.push('/ChatGPT Image Mar 17, 2026, 10_58_54 AM.png');
      images.push('/Untitled design (38).png');
    } else if (location.pathname === '/rates') {
      images.push('/Untitled design (30).png');
    }
    return images;
  }, [isHomePage]);

  const imagesReady = useImagePreloader(criticalImages);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (imagesReady) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [imagesReady]);

  if (isLoading && !isAdminPage) {
    return <Preloader />;
  }

  return (
    <main
      className="min-h-screen Selection:bg-magenta-100 Selection:text-magenta-900 relative"
      style={{
        backgroundColor: isHomePage ? '#FFFFFF' : '#fafafb',
        ...(!isAdminPage ? {
          backgroundImage: isHomePage
            ? 'url("/Abhinav web.psd.jpg")'
            : location.pathname === '/alerts'
              ? 'url("/WhatsApp Image 2026-03-12 at 2.19.24 PM.jpeg")'
              : location.pathname === '/videos'
                ? 'url("/Untitled design (10).png")'
                : 'url("/Untitled design (14).png")',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        } : {})
      }}
    >
      

      {/* Header and Ticker Grouped to prevent gaps */}
      {!isAdminPage && (
        <div className="flex flex-col relative w-full bg-transparent">
          <Navigation />
          <section className="relative w-full bg-transparent">
            {isHomePage ? (
              <>
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src="/Untitled design (23).jpg"
                  alt="Abhinav Gold & Silver Header Mobile"
                  className="w-full h-auto md:hidden object-contain object-center block"
                />
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src="/Untitled design (41).png"
                  alt="Abhinav Gold & Silver Header Desktop"
                  className="w-full h-auto hidden md:block object-cover object-center block"
                />
              </>
            ) : (
              <div className="flex flex-col">
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={['/alerts', '/videos'].includes(location.pathname) ? "/Untitled design (31).png" : location.pathname === '/rates' ? "/Untitled (A2 (Landscape)).png" : "/Untitled design (21).png"}
                  alt="Abhinav Gold & Silver Header Mobile"
                  className={`${['/alerts', '/videos'].includes(location.pathname) ? 'w-[50%] mx-auto py-4 mt-16 max-w-[200px]' : location.pathname === '/rates' ? 'w-full' : 'w-full min-h-[220px]'} h-auto md:hidden ${location.pathname === '/rates' ? 'object-contain' : 'object-cover'} object-center block`}
                />
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={['/alerts', '/videos'].includes(location.pathname) ? "/Untitled design (31).png" : "/Untitled design (30).png"}
                  alt="Abhinav Gold & Silver Header Desktop"
                  className={`${['/alerts', '/videos'].includes(location.pathname) ? 'w-[30%] mx-auto py-6 max-w-[250px]' : location.pathname === '/rates' ? 'w-full' : 'w-full min-h-[350px]'} h-auto hidden md:block ${location.pathname === '/rates' ? 'object-contain' : 'object-cover'} object-center block`}
                />
              </div>
            )}

            {/* Overlaid Spot Rates Bar - Home page only */}
            {isHomePage && (
              <div className="absolute bottom-[5%] md:bottom-[10%] left-0 w-full z-20 flex justify-end px-1 md:px-0">
                <SpotBar />
              </div>
            )}
          </section>
          


          {/* Global Scrolling Ticker - Snapped to header section - Mobile Only */}
          {!isHomePage && (
            <div className={`md:hidden z-10 w-full relative ${location.pathname === '/rates' ? 'mt-0' : 'mt-6'}`}>
              <Ticker />
            </div>
          )}
        </div>
      )}

      <MusicPlayer isEnabled={isMusicEnabled} />

      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      {/* Bottom Footer Navigation — hidden on Admin, Mobile Only */}
      {!isAdminPage && <BottomNav />}

      {/* Desktop Ticker — Above Footer, Desktop Only */}
      {!isAdminPage && !isHomePage && (
        <div className={`hidden md:block ${location.pathname === '/rates' ? 'md:-mt-28' : 'mt-10'}`}>
          <Ticker />
        </div>
      )}

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

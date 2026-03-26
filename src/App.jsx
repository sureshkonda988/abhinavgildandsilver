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

// Scroll to top instantly on every page navigation — fires BEFORE browser paint
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};


const Preloader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-internal.webp")' }}
    />
    <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for better contrast */}
    <motion.img
      src="/logo.webp"
      alt="Abhinav Loading"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative z-10 max-w-[80%] max-h-[80%] object-contain"
    />
  </div>
);

const useImagePreloader = (imageList) => {
  const [imagesPreloaded, setImagesPreloaded] = React.useState(false);

  React.useEffect(() => {
    setImagesPreloaded(false);
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
    const images = ['/logo.webp', '/bg-internal.webp', '/bg-ticker.webp'];
    if (isHomePage) {
      images.push('/desktop-home-header.webp');
      images.push('/mobile-home-header.webp');
      images.push('/mh.webp');
      images.push('/Abhinav web.psd.webp');
      images.push('/Untitled design (25).webp');
      images.push('/ChatGPT Image Mar 17, 2026, 10_58_54 AM.webp');
      images.push('/Untitled design (38).webp');
    } else if (location.pathname === '/rates') {
      images.push('/desktop-rates-header.webp');
      images.push('/mobile-rates-header.webp');
    }
    return images;
  }, [isHomePage, location.pathname]);

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
      className={`min-h-screen Selection:bg-magenta-100 Selection:text-magenta-900 relative responsive-bg ${isHomePage ? 'home-bg' : ''}`}
      style={{
        backgroundColor: isHomePage ? '#FFFFFF' : '#fafafb',
        ...(!isAdminPage ? {
          // Main background is now handled by the .bg-container div below for better control
          backgroundColor: isHomePage ? 'transparent' : '#fafafb',
        } : {})
      }}
    >
      {/* Responsive Background Layer */}
      {!isAdminPage && (
        <div className="bg-container">
          {/* Desktop/Common Backgrounds */}
          {isHomePage ? (
            <img 
              src="/bg-home-desktop.webp" 
              alt="Home Desktop Background" 
              className="responsive-bg-img hidden md:block" 
            />
          ) : (
            <img 
              src={
                location.pathname === '/alerts'
                  ? "/bg-alerts.webp"
                  : location.pathname === '/videos'
                    ? "/bg-videos.webp"
                    : "/bg-internal.webp"
              } 
              alt="Internal Background" 
              className="responsive-bg-img"
              key={location.pathname}
            />
          )}

          {/* Home Mobile Background */}
          {isHomePage && (
            <img 
              src="/bg-home-mobile.webp" 
              alt="Home Mobile Background" 
              className="responsive-bg-img md:hidden"
            />
          )}
        </div>
      )}
      

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
                  src="/mobile-home-header.webp"
                  alt="Abhinav Gold & Silver Header Mobile"
                  className="w-full h-auto md:hidden object-contain object-center block"
                />
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src="/desktop-home-header.webp"
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
                  src={location.pathname === '/rates' ? "/mobile-rates-header.webp" : ['/alerts', '/videos'].includes(location.pathname) ? "/logo.webp" : "/header-internal-mobile.webp"}
                  alt={['/alerts', '/videos'].includes(location.pathname) ? "Abhinav Gold & Silver Logo" : "Abhinav Gold & Silver Header Mobile"}
                  className={`${['/alerts', '/videos'].includes(location.pathname) ? 'w-[50%] mx-auto py-2 mt-12 max-w-[200px]' : location.pathname === '/rates' ? 'w-full h-auto' : 'w-full min-h-[180px]'} h-auto md:hidden ${location.pathname === '/rates' ? '' : 'object-cover'} object-center block`}
                />
                <motion.img
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={location.pathname === '/rates' ? "/desktop-rates-header.webp" : ['/alerts', '/videos'].includes(location.pathname) ? "/logo.webp" : "/header-rates-desktop.webp"}
                  alt={['/alerts', '/videos'].includes(location.pathname) ? "Abhinav Gold & Silver Logo" : "Abhinav Gold & Silver Header Desktop"}
                  className={`${['/alerts', '/videos'].includes(location.pathname) ? 'w-[30%] mx-auto py-6 max-w-[250px]' : location.pathname === '/rates' ? 'w-full h-auto' : 'w-full min-h-[350px]'} h-auto hidden md:block ${location.pathname === '/rates' ? '' : 'object-cover'} object-center block`}
                />
              </div>
            )}

            {/* Overlaid Spot Rates Bar - Home page only */}
            {isHomePage && (
              <div className="absolute bottom-[-40px] md:bottom-[-115px] left-0 w-full z-20 flex justify-center px-1 md:px-0">
                <SpotBar />
              </div>
            )}
          </section>
          


          {/* Global Scrolling Ticker - Snapped to header section - Mobile Only */}
          {!isHomePage && (
            <div className={`z-10 w-full relative ${location.pathname === '/rates' ? 'mt-0' : 'mt-6'}`}>
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



      {/* Desktop Footer — hidden on Admin, Desktop Only */}
      {!isAdminPage && (
        <div className={location.pathname === '/alerts' ? 'block' : 'hidden md:block'}>
          <Footer />
        </div>
      )}
    </main>
  );
};

function App() {
  return (
    <RateProvider>
      <Router>
        <ScrollToTop />
        <AppLayout />
      </Router>
    </RateProvider>
  );
}

export default App;

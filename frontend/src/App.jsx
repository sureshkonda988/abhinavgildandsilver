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
  const { isMusicEnabled, setMusicEnabled } = useRates();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  // Only preload ultra-critical small assets and the logo to ensure fast navigation
  const criticalImages = React.useMemo(() => {
    return ['/logo.webp', '/bg-internal.webp', '/bg-ticker.webp', '/desktop-rates-header.webp', '/header-rates-desktop.webp'];
  }, []);

  const imagesReady = useImagePreloader(criticalImages);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (imagesReady) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [imagesReady]);

  // Reset loading state briefly on route change to ensure a clean UI transition
  // and prevent the "stale home page" from persisting during heavy rendering.
  React.useEffect(() => {
    setIsLoading(true);
    // Keep music enabled on pages that support playback, and turn it off elsewhere.
    const isMusicPage = location.pathname === '/' || location.pathname === '/rates';
    if (!isMusicPage && setMusicEnabled) setMusicEnabled(false);
    
    // After 50ms, the new route's content should be ready to render
    const timer = setTimeout(() => setIsLoading(false), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading && !isAdminPage) {
    return <Preloader />;
  }

  return (
    <>
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
        <>
          <div className="flex flex-col sticky top-0 w-full z-50 bg-transparent">
            <Navigation />
            {isHomePage && (
              <div className="relative w-full">
                <section className="relative w-full bg-transparent overflow-hidden">
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
                    loading="eager"
                    src="/desktop-home-header.webp"
                    alt="Abhinav Gold & Silver Header Desktop"
                    className="w-full h-auto hidden md:block object-cover object-center block"
                  />
                </section>
              </div>
            )}
          </div>

          {!isHomePage && (
            <section className="relative w-full bg-transparent overflow-hidden">
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
                  loading="eager"
                  src={location.pathname === '/rates' ? "/desktop-rates-header.webp" : ['/alerts', '/videos'].includes(location.pathname) ? "/logo.webp" : "/header-rates-desktop.webp"}
                  alt={['/alerts', '/videos'].includes(location.pathname) ? "Abhinav Gold & Silver Logo" : "Abhinav Gold & Silver Header Desktop"}
                  className={`${['/alerts', '/videos'].includes(location.pathname) ? 'w-[30%] mx-auto py-6 max-w-[250px]' : location.pathname === '/rates' ? 'w-[65%] max-w-5xl mr-auto ml-4 md:ml-12 py-4 mt-6 md:mt-8 h-auto' : 'w-full min-h-[350px]'} h-auto hidden md:block ${location.pathname === '/rates' ? 'object-contain' : 'object-cover'} object-center block`}
                />
                
                {/* Ticker exactly touching the image bottom */}
                {location.pathname === '/rates' && (
                  <div className="w-full -mt-3 md:-mt-6 z-50 overflow-hidden">
                    <Ticker />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Home Page Spot Rates Bar - Now scrolls with content */}
          {isHomePage && (
            <div className="relative z-20 flex justify-center items-center gap-2 lg:gap-8 px-1 md:px-0 mt-2 md:-mt-2">
              <div className="lg:translate-x-32">
                <SpotBar />
              </div>
              {/* Decorative Image - Now Scrollable again */}
              <motion.img 
                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                src="/Untitled-design-(3).webp" 
                alt="" 
                className="absolute md:relative block w-16 md:w-24 lg:w-36 h-auto object-contain drop-shadow-2xl -scale-x-100 -translate-y-24 -translate-x-20 md:translate-x-0 md:-translate-y-16 lg:-translate-y-32 right-0 md:right-auto z-20" 
              />
            </div>
          )}
        </>
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

      {/* Global Scrolling Ticker moved below Routes per user request to be below rates table */}
      {!isAdminPage && !isHomePage && location.pathname !== '/rates' && (
        <div className={`z-10 w-full relative -mt-4 md:-mt-10`}>
          <Ticker />
        </div>
      )}

      {!isAdminPage && (
        <div className={location.pathname === '/alerts' ? 'block' : 'hidden md:block'}>
          <Footer />
        </div>
      )}

      </main>

      {!isAdminPage && <BottomNav />}
    </>

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

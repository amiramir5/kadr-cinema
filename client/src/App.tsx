import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { MediaDetails } from './pages/MediaDetails';
import { Explore } from './pages/Explore';
import { MyList } from './pages/MyList';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <UserProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-kadr-bg text-kadr-text font-vazir antialiased selection:bg-kadr-primary-light selection:text-kadr-primary">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/title/:mediaType/:id" element={<MediaDetails />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/my-list" element={<MyList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;

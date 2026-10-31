import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
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
        <div className="min-h-screen flex bg-kadr-bg text-kadr-text font-vazir antialiased">
          
          {/* Fixed Right Sidebar for Desktop matching reference */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 px-4 sm:px-10 py-6 max-w-7xl w-full mx-auto">
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
          </div>

          <MobileNav />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;

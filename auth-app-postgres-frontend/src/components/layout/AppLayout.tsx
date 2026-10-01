import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`main-content-wrapper ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <main className="page-container">
          <Outlet />
        </main>

        <footer className="app-footer">
          <p>© 2026 AuthApp Telecom. Tüm hakları saklıdır.</p>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};

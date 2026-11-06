import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

/**
 * PublicLayout
 * Wraps all public-facing pages with the shared Navbar and Footer.
 */
function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;

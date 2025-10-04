import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (page: string) => {
    setMobileMenuOpen(false);
    if (page === 'home') {
      onNavigate('home');
      setTimeout(() => {
        scrollToSection('hero');
      }, 100);
    } else if (page === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('home');
      setTimeout(() => {
        scrollToSection(page);
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover bg-primary logo-hover" />
            <h1 className="text-2xl font-bold text-primary glow-hover-title">
              {t('siteName', 'Grand Slam')}
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavigation('home')}
              className={`nav-link transition-all ${
                currentPage === 'home' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`}
            >
              {t('home', 'Home')}
            </button>
            <button
              onClick={() => handleNavigation('courtAvailability')}
              className={`nav-link transition-all ${
                currentPage === 'courtAvailability' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`}
            >
              {t('court', 'Court')}
            </button>
            <button
              onClick={() => handleNavigation('padelShop')}
              className={`nav-link transition-all ${
                currentPage === 'padelShop' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`}
            >
              {t('padelShop', 'Padel Shop')}
            </button>
            <button
              onClick={() => handleNavigation('championships')}
              className={`nav-link transition-all ${
                currentPage === 'championships' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`}
            >
              {t('championships', 'Championships')}
            </button>
            <button
              onClick={() => handleNavigation('admin')}
              className={`nav-link transition-all ${
                currentPage === 'admin' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'
              }`}
            >
              {t('admin', 'Admin')}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="btn-outline px-3 py-2 text-sm"
            >
              {language === 'en' ? 'العربية' : t('english', 'English')}
            </button>
            
            <div className="md:hidden">
              <button className="text-primary" onClick={() => setMobileMenuOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col p-6 animate-slide-in">
            <button
              className="self-end mb-6 text-2xl text-primary"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
            <button
              onClick={() => handleNavigation('home')}
              className={`mb-4 nav-link text-lg ${currentPage === 'home' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'}`}
            >
              {t('home', 'Home')}
            </button>
            <button
              onClick={() => handleNavigation('courtAvailability')}
              className={`mb-4 nav-link text-lg ${currentPage === 'courtAvailability' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'}`}
            >
              {t('court', 'Court')}
            </button>
            <button
              onClick={() => handleNavigation('padelShop')}
              className={`mb-4 nav-link text-lg ${currentPage === 'padelShop' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'}`}
            >
              {t('padelShop', 'Padel Shop')}
            </button>
            <button
              onClick={() => handleNavigation('championships')}
              className={`mb-4 nav-link text-lg ${currentPage === 'championships' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'}`}
            >
              {t('championships', 'Championships')}
            </button>
            <button
              onClick={() => handleNavigation('admin')}
              className={`mb-4 nav-link text-lg ${currentPage === 'admin' ? 'text-accent font-semibold' : 'text-primary hover:text-accent'}`}
            >
              {t('admin', 'Admin')}
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;

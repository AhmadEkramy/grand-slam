import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroSectionProps {
  onBookNowClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookNowClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center padel-bg overflow-hidden">
      {/* SVG Background Elements */}
      <svg className="padel-bg-svg" style={{left: 40, top: 60, width: 60, height: 60, opacity: 0.18}} viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="20" stroke="#1C82AD" strokeWidth="4"/><circle cx="30" cy="30" r="12" stroke="#1C82AD" strokeWidth="2"/></svg>
      <svg className="padel-bg-svg" style={{left: 80, bottom: 40, width: 140, height: 140, opacity: 0.13}} viewBox="0 0 140 140" fill="none"><ellipse cx="70" cy="70" rx="60" ry="60" stroke="#1C82AD" strokeWidth="6"/><rect x="40" y="40" width="60" height="60" rx="10" stroke="#1C82AD" strokeWidth="2" transform="rotate(30 70 70)"/></svg>
      <svg className="padel-bg-svg" style={{right: 80, top: 40, width: 320, height: 180, opacity: 0.13}} viewBox="0 0 320 180" fill="none"><rect x="10" y="10" width="300" height="160" rx="8" stroke="#1C82AD" strokeWidth="5"/><line x1="160" y1="10" x2="160" y2="170" stroke="#1C82AD" strokeWidth="3"/><line x1="10" y1="90" x2="310" y2="90" stroke="#1C82AD" strokeWidth="3"/></svg>
      {/* End SVG Background Elements */}

      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border-4 border-white transform rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t('heroTitle', 'Book Your Padel Court Today')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle', 'Experience the best padel courts in the city with professional equipment and facilities')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onBookNowClick}
              className="btn-success text-lg px-8 py-4 glow-hover-green"
            >
              {t('bookNow', 'Book Now')} 🎾
            </button>
          </div>

          {/* Court visualization */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="court-visual glow-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white font-semibold">{t('court', 'Court')} 1</span>
              </div>
            </div>
            <div className="court-visual glow-hover animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white font-semibold">{t('court', 'Court')} 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 right-1/4 animate-pulse">
        <div className="text-6xl">🎾</div>
      </div>
      <div className="absolute bottom-1/4 left-1/3 animate-pulse" style={{ animationDelay: '1s' }}>
        <div className="text-4xl">🏆</div>
      </div>
    </section>
  );
};

export default HeroSection;

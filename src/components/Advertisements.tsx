
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdvertisements } from '../hooks/useAdvertisements';

const Advertisements: React.FC = () => {
  const { t } = useLanguage();
  const { advertisements } = useAdvertisements();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-primary mb-12">
          {t('advertisements', 'Advertisements')}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {advertisements.map(ad => (
            <div key={ad.id} className="card hover-lift cursor-pointer">
              <img
                src={ad.image}
                alt={ad.title || 'Advertisement'}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              {ad.title && (
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {ad.title}
                </h3>
              )}
              {ad.description && (
                <p className="text-gray-600 mb-4">
                  {ad.description}
                </p>
              )}
              {ad.link && (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-block"
                >
                  {t('viewDetails', 'View Details')} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advertisements;

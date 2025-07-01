import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TrainingCard } from '../types';

const packages = [
  { hours: 1, price: 250, vip: false },
  { hours: 2, price: 450, vip: false },
  { hours: 3, price: 650, vip: false },
  { hours: 4, price: 800, vip: true },
];

const OurPackages: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-extrabold text-primary mb-4">{t('ourPackages', 'Our Packages')}</h2>
        <p className="text-xl text-gray-500 mb-12">{t('chooseDuration', 'Choose the perfect duration for your game')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.hours}
              className={`relative bg-white rounded-2xl shadow-sm border ${pkg.vip ? 'border-green-400' : 'border-gray-200'} flex flex-col items-center py-10 px-6 transition-all duration-300 hover:shadow-lg`}
            >
              {pkg.vip && (
                <span className="absolute top-5 right-5 flex items-center bg-gradient-to-r from-green-400 to-cyan-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v9" /></svg>
                  {t('vip', 'VIP')}
                </span>
              )}
              <div className="flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                <span className="text-2xl font-bold text-primary">{pkg.hours} {t('hour', 'Hour')}{pkg.hours > 1 ? t('hours', 's') : ''}</span>
              </div>
              <span className="text-5xl font-extrabold text-primary">{pkg.price}</span>
              <span className="text-lg text-gray-500 ml-2">{t('egp', 'EGP')}</span>
              <button
                className={
                  pkg.vip
                    ? 'w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-400 to-cyan-500 hover:from-green-600 hover:to-cyan-700 hover:shadow-lg transition-all duration-300 shadow-md'
                    : 'w-full py-3 rounded-lg font-semibold text-white bg-[#13005A] hover:bg-[#1C82AD] hover:shadow-lg transition-all duration-300 shadow-md'
                }
              >
                {t('bookNow', 'Book Now')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface TrainingSectionProps {
  trainings: TrainingCard[];
}

export const TrainingSection: React.FC<TrainingSectionProps> = ({ trainings }) => {
  const { t } = useLanguage();
  const whatsappNumber = '201006115163';
  const whatsappMsg = encodeURIComponent('I want to subscribe in the padel training');
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">
          {t('trainingSectionTitle', 'Training Section')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {trainings.map((training, idx) => (
            <div key={training.id || idx} className="card flex flex-col items-center text-center">
              <img src={training.image} alt={training.title} className="w-full h-56 object-cover rounded-lg mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{training.title}</h3>
              <p className="text-gray-600 mb-4">{training.description}</p>
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-lg font-bold text-green-700 mb-2">{training.price} {t('egp', 'EGP')}</span>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#13005A] hover:bg-[#1C82AD] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all"
                >
                  {t('subscribeNow', 'Subscribe now')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPackages; 
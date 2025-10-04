import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useChampionships } from '../hooks/useChampionships';

const Championships: React.FC = () => {
  const { t } = useLanguage();
  const { championships } = useChampionships();

  const handleRegister = (championship: any) => {
    const message = encodeURIComponent(`Hi! I want to register for ${championship.title} on ${championship.date}`);
    window.open(`https://wa.me/+201006115163?text=${message}`, '_blank');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-primary mb-12">
          {t('championships', 'Championships')}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {championships.map(championship => (
            <div key={championship.id} className="card hover-lift">
              <img
                src={championship.image || '/placeholder.svg'}
                alt={championship.title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-bold text-primary mb-3">
                {championship.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {championship.description}
              </p>
              {championship.teams && (
                <div className="text-primary font-semibold mb-2">
                  {t('teamsPlaying', 'Teams Playing:')} {Array.isArray(championship.teams)
                    ? championship.teams.map((matchup: any, idx: number) => (
                        <div key={idx}>{matchup.teamA} vs {matchup.teamB}</div>
                      ))
                    : championship.teams}
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-accent font-semibold">📅 {championship.date}</p>
                  <p className="text-accent font-semibold">🕒 {championship.time}</p>
                </div>
                {championship.registrationEnabled && (
                  <button
                    onClick={() => handleRegister(championship)}
                    className="btn-success"
                  >
                    {t('register', 'Register')} 🏆
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Championships;

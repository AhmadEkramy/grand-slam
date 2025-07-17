import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBookings } from '../hooks/useBookings';
import { TIME_SLOTS } from '../types';
import { MapPin } from 'lucide-react';

interface CourtAvailabilityProps {
  onBookSlot: (court: 1 | 2, time: string, date: string) => void;
  isAdmin?: boolean;
}

const CourtAvailability: React.FC<CourtAvailabilityProps> = ({ onBookSlot, isAdmin }) => {
  const { t, language } = useLanguage();
  const { getAvailableSlots } = useBookings();
  
  // Get today's date properly
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  const [selectedDate, setSelectedDate] = useState(todayString);
  
  const availableSlots = getAvailableSlots(selectedDate);

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-primary mb-4">
          {t('courtAvailability', 'Court Availability')}
        </h2>
        <p className="text-xl text-center text-gray-600 mb-8">
          {formatDate(selectedDate)}
        </p>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control max-w-xs mx-auto block"
              {...(isAdmin ? {} : { min: todayString })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(courtNumber => (
              <div key={courtNumber} className="rounded-2xl shadow bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-[#13005A] to-[#1C82AD] px-6 py-4 flex items-center gap-2">
                  <MapPin className="text-green-400 w-6 h-6" />
                  <span className="text-white text-2xl font-bold">{t(`court${courtNumber}`, `Court ${courtNumber}`)}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-primary">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {t('selectTime', 'Select Time')}
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {TIME_SLOTS.map(timeSlot => {
                      const slot = availableSlots.find(s => s.time === timeSlot && s.court === courtNumber);
                      const isAvailable = slot?.available || false;
                      // Format time for Arabic
                      let displayTime = timeSlot;
                      if (language === 'ar') {
                        displayTime = timeSlot.replace('AM', 'ص').replace('PM', 'م');
                      }
                      return (
                        <button
                          key={`${courtNumber}-${timeSlot}`}
                          className={`w-full py-2 rounded-lg font-semibold border transition-all
                            ${isAvailable ? 'border-green-400 text-primary bg-white hover:bg-green-50' : 'border-red-400 text-red-400 bg-red-50 cursor-not-allowed opacity-60'}
                          `}
                          disabled={!isAvailable}
                          onClick={isAvailable ? () => onBookSlot(courtNumber as 1 | 2, timeSlot, selectedDate) : undefined}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-6 justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-5 h-5 rounded bg-green-400"></span>
                      <span className="text-gray-700 font-medium">{t('available', 'Available')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-5 h-5 rounded bg-red-400"></span>
                      <span className="text-gray-700 font-medium">{t('booked', 'Booked')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourtAvailability;

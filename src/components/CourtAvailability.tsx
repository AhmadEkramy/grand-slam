
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBookings } from '../hooks/useBookings';
import { TIME_SLOTS } from '../types';

interface CourtAvailabilityProps {
  onBookSlot: () => void;
}

const CourtAvailability: React.FC<CourtAvailabilityProps> = ({ onBookSlot }) => {
  const { t } = useLanguage();
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
              min={todayString}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(courtNumber => (
              <div key={courtNumber} className="card">
                <h3 className="text-2xl font-bold text-primary mb-6">
                  {t('court', 'Court')} {courtNumber}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(timeSlot => {
                    const slot = availableSlots.find(s => s.time === timeSlot && s.court === courtNumber);
                    const isAvailable = slot?.available || false;
                    
                    return (
                      <button
                        key={`${courtNumber}-${timeSlot}`}
                        onClick={isAvailable ? onBookSlot : undefined}
                        className={`time-slot ${isAvailable ? '' : 'booked'}`}
                        disabled={!isAvailable}
                      >
                        {timeSlot}
                      </button>
                    );
                  })}
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

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { RESERVATION_TYPES, TIME_SLOTS } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  loading: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Get today's date properly
  const today = new Date();
  const todayString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    court: 1 as 1 | 2,
    reservationType: '1hour' as keyof typeof RESERVATION_TYPES,
    startTime: '',
    date: todayString
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    setFormData({...formData, phoneNumber: value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reservationInfo = RESERVATION_TYPES[formData.reservationType];
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const startPeriod = formData.startTime.includes('AM') ? 'AM' : 'PM';
    
    let endHour = startHour + reservationInfo.duration;
    let endPeriod = startPeriod;
    
    if (startPeriod === 'AM' && endHour >= 12) {
      endPeriod = 'PM';
      if (endHour > 12) endHour -= 12;
    } else if (startPeriod === 'PM' && endHour > 12) {
      endHour -= 12;
      if (endHour === 12) endPeriod = 'AM';
    }
    
    const endTime = `${endHour}:00 ${endPeriod}`;

    const bookingData = {
      ...formData,
      endTime,
      price: reservationInfo.price
    };

    onSubmit(bookingData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">
              {t('bookNow', 'Book Now')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                {t('fullName', 'Full Name')}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="form-control"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('phoneNumber', 'Phone Number')}
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="0123456789"
                className="form-control"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="form-control"
                min={todayString}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('selectCourt', 'Select Court')}
              </label>
              <select
                value={formData.court}
                onChange={(e) => setFormData({...formData, court: parseInt(e.target.value) as 1 | 2})}
                className="form-control"
              >
                <option value={1}>{t('court', 'Court')} 1</option>
                <option value={2}>{t('court', 'Court')} 2</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('reservationType', 'Reservation Type')}
              </label>
              <select
                value={formData.reservationType}
                onChange={(e) => setFormData({...formData, reservationType: e.target.value as keyof typeof RESERVATION_TYPES})}
                className="form-control"
              >
                {Object.entries(RESERVATION_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label} - {value.price} {t('egp', 'EGP')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t('startTime', 'Start Time')}
              </label>
              <select
                required
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="form-control"
              >
                <option value="">Select time</option>
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-success w-full"
              >
                {loading ? t('loading', 'Loading...') : t('submitBooking', 'Submit Booking')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

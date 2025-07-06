import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { RESERVATION_TYPES, TIME_SLOTS } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  loading: boolean;
  getAvailableSlots: (date: string) => { time: string; available: boolean; court: 1 | 2 }[];
  selectedCourt?: 1 | 2 | null;
  selectedTime?: string;
  selectedDate?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, loading, getAvailableSlots, selectedCourt, selectedTime, selectedDate }) => {
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
    court: selectedCourt || 1,
    reservationType: '1hour' as keyof typeof RESERVATION_TYPES,
    startTime: selectedTime || '',
    date: selectedDate || todayString
  });

  // Get available slots for the selected date
  const availableSlots = getAvailableSlots(formData.date).filter(slot => slot.court === formData.court && slot.available);
  const availableTimes = availableSlots.map(slot => slot.time);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    setFormData({...formData, phoneNumber: value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reservationInfo = RESERVATION_TYPES[formData.reservationType];
    const startIdx = TIME_SLOTS.indexOf(formData.startTime);
    const endIdx = startIdx + reservationInfo.duration;
    const endTime = TIME_SLOTS[endIdx];

    const bookingData = {
      ...formData,
      endTime,
      price: reservationInfo.price
    };

    onSubmit(bookingData);
  };

  useEffect(() => {
    setFormData(f => ({
      ...f,
      court: selectedCourt || 1,
      startTime: selectedTime || '',
      date: selectedDate || todayString
    }));
  }, [selectedCourt, selectedTime, selectedDate, isOpen]);

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
                onChange={(e) => setFormData({...formData, date: e.target.value, startTime: ''})}
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
                onChange={(e) => setFormData({...formData, court: parseInt(e.target.value) as 1 | 2, startTime: ''})}
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
              <div>
                <div className="font-semibold text-primary mb-2">Available Times</div>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {TIME_SLOTS.filter(slot => availableTimes.includes(slot)).map(slot => (
                    <button
                      type="button"
                      key={slot}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all
                        ${formData.startTime === slot ? 'bg-[#00c896] text-white' : 'bg-gray-100 text-gray-800 hover:bg-[#2196c3] hover:text-white'}
                      `}
                      onClick={() => setFormData({...formData, startTime: slot})}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
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

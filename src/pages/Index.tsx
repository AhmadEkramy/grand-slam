import React, { useState } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CourtAvailability from '../components/CourtAvailability';
import PadelShop from '../components/PadelShop';
import Championships from '../components/Championships';
import Advertisements from '../components/Advertisements';
import BookingModal from '../components/BookingModal';
import AdminDashboard from '../components/AdminDashboard';
import LoginPage from '../components/LoginPage';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { useBookings } from '../hooks/useBookings';
import OurPackages from '../components/OurPackages';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { addBooking, loading, getAvailableSlots } = useBookings();
  const { user } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<1 | 2 | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      const bookingWithUser = {
        ...bookingData,
        userId: user?.uid || 'anonymous',
        userPhone: bookingData.phone || 'no-phone'
      };
      
      await addBooking(bookingWithUser);
      setShowBookingModal(false);
      alert('✅ You have successfully booked the court. Enjoy your game!');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book the court. Please try again.');
    }
  };

  const handleBookSlot = (court: 1 | 2, time: string, date: string) => {
    setSelectedCourt(court);
    setSelectedTime(time);
    setSelectedDate(date);
    setShowBookingModal(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'admin':
        if (!user) {
          return <LoginPage onBack={() => setCurrentPage('home')} />;
        }
        return <AdminDashboard onNavigateHome={() => setCurrentPage('home')} />;
      default:
        return (
          <>
            <div id="hero">
              <HeroSection onBookNowClick={() => setShowBookingModal(true)} />
            </div>
            <Advertisements />
            <div id="courtAvailability">
              <CourtAvailability onBookSlot={handleBookSlot} />
            </div>
            <div id="ourPackages">
              <OurPackages />
            </div>
            <div id="padelShop">
              <PadelShop />
            </div>
            <div id="championships">
              <Championships />
            </div>
          </>
        );
    }
  };

  const shouldShowNavbar = !(currentPage === 'admin' && user);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        {/* Only show navbar if not on admin page or if user is not authenticated */}
        {shouldShowNavbar && (
          <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        )}
        
        {renderCurrentPage()}

        {showBookingModal && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onSubmit={handleBookingSubmit}
            loading={loading}
            getAvailableSlots={getAvailableSlots}
            selectedCourt={selectedCourt}
            selectedTime={selectedTime}
            selectedDate={selectedDate}
          />
        )}

        <WhatsAppFloat />
      </div>
    </LanguageProvider>
  );
};

export default Index;

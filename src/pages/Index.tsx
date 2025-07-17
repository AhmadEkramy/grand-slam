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
import OurPackages, { TrainingSection } from '../components/OurPackages';
import SocialFloat from '../components/SocialFloat';
import { useBookings, useTrainingCards } from '../hooks/useBookings';
import { TrainingCard } from '../types';
import { Toaster } from "../components/ui/toaster";
import { toast } from "../hooks/use-toast";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { addBooking, loading, getAvailableSlots } = useBookings();
  const { user } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<1 | 2 | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { trainingCards, loading: trainingLoading } = useTrainingCards();

  // قائمة إيميلات الأدمن
  const adminEmails = [
    'ahmedekramyabdellatif@gmail.com', // عدل هذا الإيميل أو أضف إيميلات الأدمن الحقيقية
    'mohamed@grandslam.com'
  ];

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      const bookingWithUser = {
        ...bookingData,
        userId: user?.uid || 'anonymous',
        userPhone: bookingData.phone || 'no-phone'
      };
      
      await addBooking(bookingWithUser);
      setShowBookingModal(false);
      toast({
        title: '✅ تم الحجز بنجاح',
        description: 'تم حجز الملعب بنجاح! استمتع باللعب 🎾',
      });
      // Send WhatsApp message only after successful booking
      const whatsappNumber = '201006115163'; // without +
      const message =
        `New Booking:%0A` +
        `Name: ${bookingData.fullName}%0A` +
        `Phone: ${bookingData.phoneNumber}%0A` +
        `Court: ${bookingData.court}%0A` +
        `Date: ${bookingData.date}%0A` +
        `Start Time: ${bookingData.startTime}%0A` +
        `End Time: ${bookingData.endTime}%0A` +
        `Type: ${bookingData.reservationType}%0A` +
        `Price: ${bookingData.price}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } catch (error) {
      console.error('Booking failed:', error);
      if (error.message.includes('conflicts')) {
        toast({
          title: '❌ تعذر الحجز',
          description: 'هذا الوقت محجوز بالفعل. يرجى اختيار وقت آخر.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '❌ حدث خطأ',
          description: 'تعذر إتمام الحجز. حاول مرة أخرى.',
          variant: 'destructive',
        });
      }
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
              <CourtAvailability
                onBookSlot={handleBookSlot}
                isAdmin={currentPage === 'admin' || (user && adminEmails.includes(user.email))}
              />
            </div>
            <div id="ourPackages">
              <OurPackages />
            </div>
            <div id="padelShop">
              <PadelShop />
            </div>
            <div id="trainingSection">
              <TrainingSection trainings={trainingCards} />
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

        <SocialFloat />
        <Toaster />
      </div>
    </LanguageProvider>
  );
};

export default Index;

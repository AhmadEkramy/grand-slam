import { useEffect, useState } from 'react';
import AdminDashboard from '../components/AdminDashboard';
import Advertisements from '../components/Advertisements';
import BookingModal from '../components/BookingModal';
import Championships from '../components/Championships';
import CourtAvailability from '../components/CourtAvailability';
import HeroSection from '../components/HeroSection';
import LoginPage from '../components/LoginPage';
import Navbar from '../components/Navbar';
import OurPackages, { TrainingSection } from '../components/OurPackages';
import PadelShop from '../components/PadelShop';
import Profile from '../components/Profile';
import SocialFloat from '../components/SocialFloat';
import { Toaster } from "../components/ui/toaster";
import { LanguageProvider } from '../contexts/LanguageContext';
import { toast } from "../hooks/use-toast";
import useAdmins, { isAdminUser } from '../hooks/useAdmins';
import { useAuth } from '../hooks/useAuth';
import { useBookings, useTrainingCards } from '../hooks/useBookings';
import { Booking } from '../types';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { addBooking, loading, getAvailableSlots } = useBookings();
  const { user } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<1 | 2 | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { trainingCards, loading: trainingLoading } = useTrainingCards();

  const { admins, isAdminByEmail } = useAdmins();
  const [isAdmin, setIsAdmin] = useState(false);

  // keep local isAdmin state in sync with authenticated user
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      try {
        const result = await isAdminUser({ uid: user.uid, email: user.email || '' });
        if (mounted) setIsAdmin(result);
      } catch (err) {
        console.warn('Failed to determine admin status:', err);
        if (mounted) setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const handleBookingSubmit = async (bookingData: unknown) => {
    try {
      const data = (bookingData && typeof bookingData === 'object') ? (bookingData as Record<string, unknown>) : {};
      const phone = typeof data.phone === 'string' ? data.phone : (typeof data.phoneNumber === 'string' ? data.phoneNumber : 'no-phone');
      const bookingWithUser = {
        ...(data as Omit<Booking, 'id' | 'createdAt' | 'status'>),
        userId: user?.uid ?? 'anonymous',
        userPhone: phone
      } as Omit<Booking, 'id' | 'createdAt' | 'status'>;

      await addBooking(bookingWithUser);
      setShowBookingModal(false);
      toast({
        title: '✅ تم الحجز بنجاح',
        description: 'تم حجز الملعب بنجاح! استمتع باللعب 🎾',
      });
      // Send WhatsApp message only after successful booking
      try {
        const whatsappNumber = '201006115163'; // without +
        const name = typeof data.fullName === 'string' ? data.fullName : '';
        const phoneField = typeof data.phoneNumber === 'string' ? data.phoneNumber : (typeof data.phone === 'string' ? data.phone : '');
        const courtField = typeof data.court !== 'undefined' ? String(data.court) : '';
        const dateField = typeof data.date === 'string' ? data.date : '';
        const startField = typeof data.startTime === 'string' ? data.startTime : '';
        const endField = typeof data.endTime === 'string' ? data.endTime : '';
        const typeField = typeof data.reservationType === 'string' ? data.reservationType : '';
        const priceField = typeof data.price !== 'undefined' ? String(data.price) : '';
        const message =
          `New Booking:%0A` +
          `Name: ${name}%0A` +
          `Phone: ${phoneField}%0A` +
          `Court: ${courtField}%0A` +
          `Date: ${dateField}%0A` +
          `Start Time: ${startField}%0A` +
          `End Time: ${endField}%0A` +
          `Type: ${typeField}%0A` +
          `Price: ${priceField}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      } catch (e) {
        // ignore errors building opening whatsapp
      }
    } catch (error: unknown) {
      console.error('Booking failed:', error);
      let raw = 'تعذر إتمام الحجز. حاول مرة أخرى.';
      if (error && typeof error === 'object') {
        const errObj = error as Record<string, unknown>;
        if (typeof errObj.message === 'string') raw = errObj.message;
      }
      // حاول استخراج اقتراحات الأوقات لو متوفرة في رسالة الخطأ
      let description = raw;
      const arabicMarker = 'اقتراحات أوقات متاحة:';
      if (raw.includes(arabicMarker)) {
        const parts = raw.split(arabicMarker);
        const before = parts[0]?.trim();
        const suggestions = parts[1]?.trim();
        description = before ? `${before} اقتراحات بديلة: ${suggestions}` : `اقتراحات بديلة: ${suggestions}`;
      }

      toast({
        title: '❌ تعذر الحجز',
        description,
        variant: 'destructive',
      });
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
      case 'profile':
        return <Profile />;
      case 'admin':
        if (!user) {
          return <LoginPage onBack={() => setCurrentPage('home')} />;
        }

        // Only allow users who are present in the Firestore 'admins' collection
  if (!isAdmin) {
          return (
            <div className="container mx-auto px-4 py-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">غير مسموح</h2>
              <p className="mb-6 text-gray-600">ليس لديك صلاحية الوصول إلى لوحة التحكم. يرجى تسجيل الدخول بحساب أدمن.</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="inline-flex items-center px-4 py-2 bg-[#13005A] text-white rounded-md"
              >
                العودة للرئيسية
              </button>
            </div>
          );
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
                isAdmin={currentPage === 'admin' || (user && isAdminByEmail(user.email || ''))}
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
        {/* Don't show the floating social button on the admin page to avoid UI overlap */}
        {!(currentPage === 'admin') && <SocialFloat />}
        <Toaster />
      </div>
    </LanguageProvider>
  );
};

export default Index;

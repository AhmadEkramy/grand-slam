import React from 'react';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { Booking } from '../types';
import LoginPage from './LoginPage';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    bookings,
    deleteBooking,
    deleteRecurringBooking,
    loading
  } = useBookings();

  // Filter bookings that belong to the current user
  const userBookings = bookings.filter((b) => {
    const booking = b as Booking & { isRecurring?: boolean; userId?: string; userPhone?: string };
    // Exclude recurring-as-dashboard if marked
    if (booking.isRecurring) return false;
    const uidMatch = booking.userId && user ? booking.userId === user.uid : false;
    const phoneMatch = user?.phoneNumber ? (booking.phoneNumber === user.phoneNumber || booking.userPhone === user.phoneNumber) : false;
    return uidMatch || phoneMatch;
  });

  const handleCancel = async (id: string) => {
    try {
      await deleteBooking(id);
      toast({ title: '✅ تم إلغاء الحجز', description: 'تم إلغاء الحجز بنجاح.' });
    } catch (err) {
      console.error('Cancel failed', err);
      toast({ title: '❌ فشل عند الإلغاء', description: 'حصل خطأ أثناء إلغاء الحجز.' , variant: 'destructive'});
    }
  };

  // If user is not authenticated, render the login page so they can sign in
  if (!user) {
    return (
      <LoginPage
        onBack={() => { /* parent handles navigation */ }}
        title="Profile Login"
        subtitle="Please sign in to view your bookings"
        allowSignUp={true}
      />
    );
  }

  const handleLogoutClick = async () => {
    try {
      await logout();
      toast({ title: '✅ تم تسجيل الخروج', description: 'تم تسجيل الخروج بنجاح.' });
    } catch (err) {
      console.error('Logout failed', err);
      toast({ title: '❌ فشل عند تسجيل الخروج', description: 'حصل خطأ أثناء تسجيل الخروج.' , variant: 'destructive'});
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">حسابي</h2>
        <button onClick={handleLogoutClick} className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
          تسجيل الخروج
        </button>
      </div>
      <p className="mb-6 text-sm text-gray-600">{user ? `مرحبًا ${user.email || ''}` : ''}</p>

      {loading && <div>جاري التحميل...</div>}

      {!loading && userBookings.length === 0 && (
        <div className="p-6 bg-gray-50 rounded shadow text-center">
          لا توجد حجوزات مرتبطة بحسابك حالياً.
        </div>
      )}

      {!loading && userBookings.length > 0 && (
        <div className="space-y-4">
          {userBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">{(b.fullName) || '—'}</div>
                <div className="text-sm text-gray-600">{b.date} • {b.startTime} • {`Court ${b.court}`}</div>
                <div className="text-sm mt-1">Type: {b.reservationType} • Price: {b.price} EGP</div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`px-3 py-1 rounded-full text-sm ${b.status === 'approved' ? 'bg-green-100 text-green-700' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {b.status}
                </div>
                {b.status !== 'canceled' && (
                  <button onClick={() => handleCancel(b.id)} className="mt-3 inline-flex items-center px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;

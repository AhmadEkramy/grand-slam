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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Background padel illustrations */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-10 mix-blend-multiply transform-gpu scale-110" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <g transform="translate(50,50)" opacity="0.9">
          <g transform="rotate(-15 200 150) scale(1.1)" className="animate-[float_8s_ease-in-out_infinite]">
            <path d="M120 10c30 -20 80 -10 110 20c30 30 20 80 -10 110c-30 30 -80 40 -110 10c-30 -30 -40 -90 10 -140z" fill="url(#g1)" />
            <circle cx="170" cy="90" r="8" fill="#fff" opacity="0.9" />
          </g>
          <g transform="translate(450,260) rotate(25) scale(0.9)" className="animate-[float_6s_ease-in-out_infinite]">
            <rect x="0" y="0" width="160" height="60" rx="30" fill="url(#g1)" transform="rotate(-25)" />
            <circle cx="40" cy="30" r="10" fill="#fff" opacity="0.9" />
          </g>
        </g>
      </svg>

      <div className="relative z-10 w-full max-w-3xl px-6 py-10">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-2xl p-8 shadow-2xl transform transition-all duration-700 hover:scale-102 hover:shadow-[0_20px_60px_rgba(99,102,241,0.25)]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] p-[3px] hover:scale-105 transition-transform duration-500 shadow-glow">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold text-slate-800">{(user?.displayName || user?.email || '').charAt(0).toUpperCase()}</div>
              </div>
              <div className="absolute -right-3 -bottom-3 w-10 h-10 rounded-full bg-[#06b6d4] text-white flex items-center justify-center text-sm shadow-lg animate-bounce/2">
                🎾
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight transform transition-all duration-500 hover:translate-y-[-2px]">حسابي</h2>
              <p className="mt-1 text-sm text-slate-600">{user ? `مرحبًا ${user.displayName || user.email || ''}` : ''}</p>

              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <button onClick={handleLogoutClick} className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#7c3aed] transition-all duration-500 transform hover:-translate-y-1 shadow-[0_6px_24px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.18)]">
                  تسجيل الخروج
                </button>
                <button onClick={() => toast({ title: '✨', description: 'تحديث الملف مستقبلاً' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-[#7c3aed] bg-white ring-1 ring-[#7c3aed]/10 hover:bg-[#7c3aed]/5 transition-all duration-500">
                  تحرير الملف
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading && <div className="text-center py-6">جاري التحميل...</div>}

            {!loading && userBookings.length === 0 && (
              <div className="p-6 bg-white/60 rounded-xl border border-white/30 shadow-sm text-center transition-all duration-500 hover:shadow-lg">
                <div className="text-lg font-medium mb-2">لا توجد حجوزات مرتبطة بحسابك حالياً.</div>
                <div className="text-sm text-slate-600">قم بالحجز الآن من صفحة الملعب</div>
              </div>
            )}

            {!loading && userBookings.length > 0 && (
              <div className="mt-4 grid gap-4">
                {userBookings.map((b) => (
                  <div key={b.id} className="group relative p-4 rounded-xl border border-white/30 bg-white/70 flex items-center justify-between shadow transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
                    <div>
                      <div className="font-semibold text-slate-900 text-lg">{b.fullName || '—'}</div>
                      <div className="text-sm text-slate-600 mt-1">{b.date} • {b.startTime} • Court {b.court}</div>
                      <div className="text-sm mt-2 text-slate-700">{b.reservationType} • {b.price} EGP</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-400 ${b.status === 'approved' ? 'bg-green-100 text-green-700' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {b.status}
                      </div>
                      {b.status !== 'canceled' && (
                        <button onClick={() => handleCancel(b.id)} className="mt-3 inline-flex items-center px-3 py-1 border border-red-300 text-red-600 rounded-md hover:scale-105 transition-transform duration-300">
                          إلغاء
                        </button>
                      )}
                    </div>
                    {/* subtle glowing ring on hover */}
                    <span className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: '0 0 40px rgba(124,58,237,0.18)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

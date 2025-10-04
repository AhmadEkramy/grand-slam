import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  siteName: { en: 'Grand Slam', ar: 'جراند سلام' },
  home: { en: 'Home', ar: 'الرئيسية' },
  myBookings: { en: 'My Bookings', ar: 'حجوزاتي' },
  admin: { en: 'Admin', ar: 'إدارة' },
  bookNow: { en: 'Book Now', ar: 'احجز الآن' },
  court: { en: 'Court', ar: 'الملعب' },
  court1: { en: 'Court 1', ar: 'ملعب 1' },
  court2: { en: 'Court 2', ar: 'ملعب 2' },
  available: { en: 'Available', ar: 'متاح' },
  booked: { en: 'Booked', ar: 'محجوز' },
  selectTime: { en: 'Select Time', ar: 'اختار الوقت' },
  padelShop: { en: 'Padel Shop', ar: 'منتجات البادل' },
  heroTitle: { 
    en: 'Welcome to the Grand Slam Padel Academy', 
    ar: 'اهلا بكم فى أكاديمية جراند سلام للبادل' 
  },
  heroSubtitle: { 
    en: 'Book your court today and enjoy playing padel on the best courts in Damietta Governorate inside the arena.', 
    ar: 'احجز ملعبك اليوم واستمتع بممارسة البادل على أفضل ملاعب بمحافظة دمياط داخل الساحة' 
  },
  courtAvailability: { en: 'Court Availability', ar: 'توفر الملاعب' },
  shop: { en: 'Padel Shop', ar: 'متجر البادل' },
  championships: { en: 'Championships', ar: 'البطولات' },
  advertisements: { en: 'Our Sponsors', ar: 'الرعاة الرسميين' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  selectCourt: { en: 'Select Court', ar: 'اختر الملعب' },
  reservationType: { en: 'Reservation Type', ar: 'نوع الحجز' },
  startTime: { en: 'Start Time', ar: 'وقت البداية' },
  endTime: { en: 'End Time', ar: 'وقت النهاية' },
  submitBooking: { en: 'Submit Booking', ar: 'تأكيد الحجز' },
  bookingSuccess: { 
    en: '✅ You have successfully booked the court. Enjoy your game!', 
    ar: '✅ تم حجز الملعب بنجاح. استمتع بلعبتك!' 
  },
  price: { en: 'Price', ar: 'السعر' },
  buyNow: { en: 'Buy Now', ar: 'اشتري الآن' },
  egp: { en: 'EGP', ar: 'جنيه' },
  register: { en: 'Register', ar: 'سجل' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save', ar: 'حفظ' },
  close: { en: 'Close', ar: 'إغلاق' },
  ourPackages: { en: 'Our Packages', ar: 'باقاتنا' },
  chooseDuration: { en: 'Choose the perfect duration for your game', ar: 'اختر المدة المثالية للعبتك' },
  vip: { en: 'VIP', ar: 'كبار الشخصيات' },
  hour: { en: 'Hour', ar: 'ساعة' },
  whatsappPurchaseMsg: { en: `Hi! I'm interested in purchasing {name} for {price} EGP`, ar: 'مرحبًا! أود شراء {name} مقابل {price} جنيه' },
  market: { en: 'Market', ar: 'السوق' },
  english: { en: 'English', ar: 'الإنجليزية' },
  trainingSectionTitle: { en: 'Training Section', ar: 'قسم التدريب' },
  trainingCard1Title: { en: 'Beginner Padel Training', ar: 'تدريب البادل للمبتدئين' },
  trainingCard1Desc: { en: 'Learn the basics of padel with our expert coaches. Perfect for newcomers!', ar: 'تعلم أساسيات البادل مع مدربينا الخبراء. مثالي للمبتدئين!' },
  trainingCard2Title: { en: 'Advanced Padel Training', ar: 'تدريب البادل المتقدم' },
  trainingCard2Desc: { en: 'Take your padel skills to the next level with advanced drills and tactics.', ar: 'ارتق بمهاراتك في البادل إلى المستوى التالي مع تدريبات وتكتيكات متقدمة.' },
  subscribeNow: { en: 'Subscribe now', ar: 'اشترك الآن' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation && translation[language]) {
      return translation[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

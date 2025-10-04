import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { Booking, RESERVATION_TYPES, RecurringBooking, TIME_SLOTS, TimeSlot, TrainingCard } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time listener for bookings
  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for recurring bookings
  useEffect(() => {
    const recurringRef = collection(db, 'recurring_bookings');
    const unsubscribe = onSnapshot(recurringRef, (snapshot) => {
      const recurringData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringBooking[];
      setRecurringBookings(recurringData);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to check if a new booking conflicts with existing bookings
  // options.bookingStatusesToCheck - if provided, only bookings with these statuses will be considered when checking conflicts
  const checkBookingConflict = (
    newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'>,
    options?: { bookingStatusesToCheck?: string[] }
  ): boolean => {
    // إضافة لوج لتسهيل تتبع المشكلة
    console.log('جاري التحقق من التعارض:', { newBooking, bookings, recurringBookings, options });
    const newStartIndex = TIME_SLOTS.indexOf(newBooking.startTime);
    const newDuration = RESERVATION_TYPES[newBooking.reservationType]?.duration || 1;
    const newEndIndex = newStartIndex + newDuration - 1;

    const statusesToCheck = options?.bookingStatusesToCheck;

    // Check normal bookings
    for (const booking of bookings) {
      if (
        booking.date === newBooking.date &&
        booking.court === newBooking.court &&
        booking.status !== 'canceled' &&
        // if statusesToCheck is provided, only consider those statuses
        (!statusesToCheck || statusesToCheck.includes(booking.status))
      ) {
        const bookingStartIndex = TIME_SLOTS.indexOf(booking.startTime);
        const bookingDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
        const bookingEndIndex = bookingStartIndex + bookingDuration - 1;

        // Check for overlap
        if (newStartIndex <= bookingEndIndex && newEndIndex >= bookingStartIndex) {
          console.log('تعارض مع حجز آخر:', booking);
          return true; // Conflict found
        }
      }
    }

    // Check recurring bookings
    const dayOfWeek = getDayOfWeek(newBooking.date);
    for (const rb of recurringBookings) {
      if (
        rb.dayOfWeek.toLowerCase() === dayOfWeek &&
        rb.status !== 'held' &&
        rb.court === newBooking.court
      ) {
        const rbStartIndex = TIME_SLOTS.indexOf(rb.startTime);
        const rbEndIndex = rbStartIndex + rb.duration - 1;

        // Check for overlap
        if (newStartIndex <= rbEndIndex && newEndIndex >= rbStartIndex) {
          console.log('تعارض مع حجز أسبوعي:', rb);
          return true; // Conflict found
        }
      }
    }

    return false; // No conflict
  };

  // Find alternative contiguous time slots for the requested duration on the same date and court
  const findAlternativeTimeSlots = (
    date: string,
    court: 1 | 2,
    duration: number,
    maxResults = 3
  ): string[] => {
    const suggestions: string[] = [];

    // helper to check if a range [startIndex, startIndex+duration-1] is free
    const isRangeAvailable = (startIndex: number) => {
      const endIndex = startIndex + duration - 1;
      if (endIndex >= TIME_SLOTS.length) return false;

      // Check normal bookings (only 'approved' bookings should block suggestions)
      for (const booking of bookings) {
        if (booking.date === date && booking.court === court && booking.status === 'approved') {
          const bookingStartIndex = TIME_SLOTS.indexOf(booking.startTime);
          const bookingDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
          const bookingEndIndex = bookingStartIndex + bookingDuration - 1;
          if (startIndex <= bookingEndIndex && endIndex >= bookingStartIndex) return false;
        }
      }

      // Check recurring bookings for that day
      const dayOfWeek = getDayOfWeek(date);
      for (const rb of recurringBookings) {
        if (rb.dayOfWeek.toLowerCase() === dayOfWeek && rb.status !== 'held' && rb.court === court) {
          const rbStartIndex = TIME_SLOTS.indexOf(rb.startTime);
          const rbEndIndex = rbStartIndex + rb.duration - 1;
          if (startIndex <= rbEndIndex && endIndex >= rbStartIndex) return false;
        }
      }

      return true;
    };

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      if (isRangeAvailable(i)) {
        const start = TIME_SLOTS[i];
        const end = TIME_SLOTS[i + duration - 1] || TIME_SLOTS[i];
        suggestions.push(`${start} - ${end}`);
        if (suggestions.length >= maxResults) break;
      }
    }

    return suggestions;
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    setLoading(true);
    try {
      // Check for conflicts before adding the booking
      if (checkBookingConflict(booking)) {
        // رسالة خطأ واضحة بالعربي مع اقتراحات أوقات بديلة
        const duration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
        const suggestions = findAlternativeTimeSlots(booking.date, booking.court, duration, 3);
        const suggestionMessage = suggestions.length > 0 ? `اقتراحات أوقات متاحة: ${suggestions.join(', ')}` : 'لا توجد اقتراحات متاحة لهذا اليوم.';
        throw new Error(`هذا الوقت محجوز بالفعل لهذا الملعب. يرجى اختيار وقت آخر. ${suggestionMessage}`);
      }
      
      const newBooking = {
        ...booking,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      };
      
      // Add doc first
      const docRef = await addDoc(collection(db, 'bookings'), newBooking);

      // QUICK SERVER-SIDE RECHECK: immediately query server for overlapping bookings
      // to catch race conditions where another client wrote a conflicting booking
      try {
        const q = query(
          collection(db, 'bookings'),
          where('date', '==', booking.date),
          where('court', '==', booking.court)
        );
        const snap = await getDocs(q);
        // Count overlapping bookings excluding the one we just created
        const newStartIndex = TIME_SLOTS.indexOf(booking.startTime);
        const newDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
        const newEndIndex = newStartIndex + newDuration - 1;

        for (const d of snap.docs) {
          if (d.id === docRef.id) continue; // skip self
          const existing = d.data() as Booking;
          if (existing.status === 'canceled') continue;
          const bookingStartIndex = TIME_SLOTS.indexOf(existing.startTime);
          const bookingDuration = RESERVATION_TYPES[existing.reservationType]?.duration || 1;
          const bookingEndIndex = bookingStartIndex + bookingDuration - 1;
          if (newStartIndex <= bookingEndIndex && newEndIndex >= bookingStartIndex) {
            // Conflict detected on server: remove our newly created booking and inform caller
            await deleteDoc(doc(db, 'bookings', docRef.id));
            const duration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
            const suggestions = findAlternativeTimeSlots(booking.date, booking.court, duration, 3);
            const suggestionMessage = suggestions.length > 0 ? `اقتراحات أوقات متاحة: ${suggestions.join(', ')}` : 'لا توجد اقتراحات متاحة لهذا اليوم.';
            throw new Error(`هذا الوقت محجوز بالفعل (تم الكشف بعد الإرسال). يرجى اختيار وقت آخر. ${suggestionMessage}`);
          }
        }
      } catch (err) {
        // If we threw due to conflict above, rethrow to caller. If getDocs failed for other reasons,
        // we silently ignore and return the new booking (we still have the booking stored).
        if ((err as Error).message && (err as Error).message.includes('هذا الوقت محجوز بالفعل')) {
          throw err;
        }
        console.warn('Server recheck failed, continuing with booking (non-fatal):', err);
      }

      return { ...newBooking, id: docRef.id };
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setLoading(true);
    try {
      // If status is being set to 'approved', validate no overlap with other approved bookings
      if (updates.status === 'approved') {
        // find the booking in current list
        const existing = bookings.find(b => b.id === id);
        if (existing) {
          // construct a tentative booking object using updates if provided
          const tentative = {
            ...existing,
            ...updates,
          } as Omit<Booking, 'id' | 'createdAt' | 'status'>;

          // When checking conflicts for approval, only consider other approved bookings (not pending)
          // Broaden check to include pending as well to avoid approving conflicting pending bookings
          const conflict = checkBookingConflict(tentative, { bookingStatusesToCheck: ['approved', 'pending'] });
          if (conflict) {
            const duration = RESERVATION_TYPES[tentative.reservationType]?.duration || 1;
            const suggestions = findAlternativeTimeSlots(tentative.date, tentative.court, duration, 3);
            const suggestionMessage = suggestions.length > 0 ? `Available alternatives: ${suggestions.join(', ')}` : 'No alternative slots available on this date.';
            throw new Error(`Cannot approve booking: time overlaps with an existing approved booking. ${suggestionMessage}`);
          }
        }
      }

      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, updates);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecurringBooking = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'recurring_bookings', id));
    } catch (error) {
      console.error('Error deleting recurring booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a new recurring booking conflicts with existing bookings
  const checkRecurringBookingConflict = (newRecurringBooking: Omit<RecurringBooking, 'id'>): boolean => {
    const newStartIndex = TIME_SLOTS.indexOf(newRecurringBooking.startTime);
    const newEndIndex = newStartIndex + newRecurringBooking.duration - 1;
    // Check other recurring bookings on the same day
    for (const rb of recurringBookings) {
      if (rb.dayOfWeek.toLowerCase() === newRecurringBooking.dayOfWeek.toLowerCase() && 
          rb.status !== 'held' && 
          rb.court === newRecurringBooking.court) {
        const rbStartIndex = TIME_SLOTS.indexOf(rb.startTime);
        const rbEndIndex = rbStartIndex + rb.duration - 1;
        // Check for overlap
        if (newStartIndex <= rbEndIndex && newEndIndex >= rbStartIndex) {
          return true; // Conflict found
        }
      }
    }
    // تحقق من تداخل الحجز الأسبوعي الجديد مع أي حجز عادي موجود
    for (const booking of bookings) {
      // قارن اليوم من الأسبوع
      const bookingDayOfWeek = getDayOfWeek(booking.date);
      if (
        bookingDayOfWeek === newRecurringBooking.dayOfWeek.toLowerCase() &&
        booking.status !== 'canceled' &&
        booking.court === newRecurringBooking.court
      ) {
        const bookingStartIndex = TIME_SLOTS.indexOf(booking.startTime);
        const bookingDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
        const bookingEndIndex = bookingStartIndex + bookingDuration - 1;
        // Check for overlap
        if (newStartIndex <= bookingEndIndex && newEndIndex >= bookingStartIndex) {
          return true; // Conflict with normal booking
        }
      }
    }
    return false; // No conflict
  };

  // دالة ترجع قائمة الحجوزات الأسبوعية مع وجود تعارض لو فيه تعارض مع حجز عادي
  const getRecurringBookingsWithConflicts = () => {
    return recurringBookings.map(rb => {
      let hasConflict = false;
      for (const booking of bookings) {
        const bookingDayOfWeek = getDayOfWeek(booking.date);
        if (
          bookingDayOfWeek === rb.dayOfWeek.toLowerCase() &&
          booking.status !== 'canceled' &&
          booking.court === rb.court
        ) {
          const bookingStartIndex = TIME_SLOTS.indexOf(booking.startTime);
          const bookingDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
          const bookingEndIndex = bookingStartIndex + bookingDuration - 1;
          const rbStartIndex = TIME_SLOTS.indexOf(rb.startTime);
          const rbEndIndex = rbStartIndex + rb.duration - 1;
          if (rbStartIndex <= bookingEndIndex && rbEndIndex >= bookingStartIndex) {
            hasConflict = true;
            break;
          }
        }
      }
      return { ...rb, hasConflict };
    });
  };

  const addRecurringBooking = async (recurringBooking: Omit<RecurringBooking, 'id'>) => {
    setLoading(true);
    try {
      // Check for conflicts before adding the recurring booking
      if (checkRecurringBookingConflict(recurringBooking)) {
        throw new Error('This time slot conflicts with an existing recurring booking. Please choose a different time.');
      }
      
      await addDoc(collection(db, 'recurring_bookings'), recurringBooking);
    } catch (error) {
      console.error('Error adding recurring booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRecurringBooking = async (id: string, updates: Partial<RecurringBooking>) => {
    setLoading(true);
    try {
      const recurringRef = doc(db, 'recurring_bookings', id);
      await updateDoc(recurringRef, updates);
    } catch (error) {
      console.error('Error updating recurring booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper to get day of week string from date
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const getAvailableSlots = (date: string): TimeSlot[] => {
    // Helper function to check if a time slot overlaps with any booking
    const isTimeSlotOverlapping = (timeSlot: string, court: 1 | 2, bookings: Booking[], recurringBookings: RecurringBooking[]) => {
      const timeSlotIndex = TIME_SLOTS.indexOf(timeSlot);
      
      // Check normal bookings
      for (const booking of bookings) {
        if (booking.date === date && booking.status !== 'canceled' && booking.court === court) {
          const bookingStartIndex = TIME_SLOTS.indexOf(booking.startTime);
          const bookingDuration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
          const bookingEndIndex = bookingStartIndex + bookingDuration - 1;
          
          // Check if the time slot falls within this booking's time range
          if (timeSlotIndex >= bookingStartIndex && timeSlotIndex <= bookingEndIndex) {
            return true;
          }
        }
      }
      
      // Check recurring bookings
      const dayOfWeek = getDayOfWeek(date);
      for (const rb of recurringBookings) {
        if (rb.dayOfWeek.toLowerCase() === dayOfWeek && rb.status !== 'held' && rb.court === court) {
          const rbStartIndex = TIME_SLOTS.indexOf(rb.startTime);
          const rbEndIndex = rbStartIndex + rb.duration - 1;
          
          // Check if the time slot falls within this recurring booking's time range
          if (timeSlotIndex >= rbStartIndex && timeSlotIndex <= rbEndIndex) {
            return true;
          }
        }
      }
      
      return false;
    };

    const allSlots: TimeSlot[] = [];
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const time12 = TIME_SLOTS[i];
      [1, 2].forEach(court => {
        const isOverlapping = isTimeSlotOverlapping(time12, court as 1 | 2, bookings, recurringBookings);
        allSlots.push({
          time: time12,
          available: !isOverlapping,
          court: court as 1 | 2
        });
      });
    }
    return allSlots;
  };

  // Helper to get price for recurring booking
  const getRecurringBookingPrice = (duration: number) => {
    // Use 1 hour = 250, 2 hours = 450, 3 hours = 650, 4 hours = 800
    switch (duration) {
      case 1: return 250;
      case 2: return 450;
      case 3: return 650;
      case 4: return 800;
      default: return duration * 250;
    }
  };

  // Add a computed list of recurring bookings as dashboard bookings
  const recurringAsBookings = recurringBookings.map(rb => {
    // Compute the next date for this dayOfWeek (for display)
    // But for dashboard, just show as recurring
    return {
      id: rb.id || '',
      fullName: rb.fullName,
      phoneNumber: rb.phoneNumber,
      court: rb.court,
      startTime: rb.startTime,
      endTime: '', // Could compute from startTime + duration
      reservationType: `${rb.duration}hour${rb.duration > 1 ? 's' : ''}`,
      date: rb.dayOfWeek,
      status: 'approved',
      price: getRecurringBookingPrice(rb.duration),
      createdAt: '',
      isRecurring: true,
    };
  });

  return {
    bookings: [...bookings, ...recurringAsBookings],
    recurringBookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    deleteRecurringBooking,
    addRecurringBooking,
    getAvailableSlots,
    updateRecurringBooking,
    getRecurringBookingPrice,
    getRecurringBookingsWithConflicts,
  };
};

export const useTrainingCards = () => {
  const [trainingCards, setTrainingCards] = useState<TrainingCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = collection(db, 'training_cards');
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainingCard[];
      setTrainingCards(data);
    });
    return () => unsubscribe();
  }, []);

  const addTrainingCard = async (card: Omit<TrainingCard, 'id'>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'training_cards'), card);
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingCard = async (id: string, updates: Partial<TrainingCard>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'training_cards', id), updates);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainingCard = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'training_cards', id));
    } finally {
      setLoading(false);
    }
  };

  return { trainingCards, loading, addTrainingCard, updateTrainingCard, deleteTrainingCard };
};

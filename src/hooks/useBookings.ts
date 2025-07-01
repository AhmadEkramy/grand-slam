import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, TimeSlot, TIME_SLOTS, RESERVATION_TYPES, RecurringBooking, TrainingCard } from '../types';

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

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    setLoading(true);
    try {
      const newBooking = {
        ...booking,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      };
      
      await addDoc(collection(db, 'bookings'), newBooking);
      return newBooking;
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

  // Helper to get day of week string from date
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const getAvailableSlots = (date: string): TimeSlot[] => {
    // Normal bookings
    const bookedSlots = bookings
      .filter(booking => booking.date === date && booking.status !== 'canceled')
      .flatMap(booking => {
        const slots = [];
        const startIdx = TIME_SLOTS.indexOf(booking.startTime);
        const duration = RESERVATION_TYPES[booking.reservationType]?.duration || 1;
        
        if (startIdx === -1) return [];

        for (let i = 0; i < duration; i++) {
          const idx = startIdx + i;
          if (idx < TIME_SLOTS.length) {
            slots.push({ time: TIME_SLOTS[idx], available: false, court: booking.court });
          }
        }
        return slots;
      });

    // Recurring bookings for this day of week
    const dayOfWeek = getDayOfWeek(date); // e.g., 'friday'
    const recurringSlots = recurringBookings
      .filter(rb => rb.dayOfWeek.toLowerCase() === dayOfWeek)
      .flatMap(rb => {
        const slots = [];
        const startIdx = TIME_SLOTS.indexOf(rb.startTime);
        for (let i = 0; i < rb.duration; i++) {
          const idx = startIdx + i;
          if (idx < TIME_SLOTS.length) {
            slots.push({ time: TIME_SLOTS[idx], available: false, court: rb.court });
          }
        }
        return slots;
      });

    // Merge both
    const allBookedSlots = [...bookedSlots, ...recurringSlots];
    const allSlots: TimeSlot[] = [];
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const time12 = TIME_SLOTS[i];
      [1, 2].forEach(court => {
        const isBooked = allBookedSlots.some(slot => 
          slot.time === time12 && slot.court === court
        );
        allSlots.push({
          time: time12,
          available: !isBooked,
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
    getAvailableSlots
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

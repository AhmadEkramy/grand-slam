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
import { Booking, TimeSlot, TIME_SLOTS, RESERVATION_TYPES } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  const getAvailableSlots = (date: string): TimeSlot[] => {
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

    const allSlots: TimeSlot[] = [];
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const time12 = TIME_SLOTS[i];
      [1, 2].forEach(court => {
        const isBooked = bookedSlots.some(slot => 
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

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    getAvailableSlots
  };
};

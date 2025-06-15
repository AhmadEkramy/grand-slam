
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
import { Booking, TimeSlot } from '../types';

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
        const startHour = parseInt(booking.startTime.split(':')[0]);
        const endHour = parseInt(booking.endTime.split(':')[0]);
        const isAM = booking.startTime.includes('AM');
        const isEndAM = booking.endTime.includes('AM');
        
        let start = isAM ? startHour : startHour === 12 ? 12 : startHour + 12;
        let end = isEndAM ? endHour : endHour === 12 ? 12 : endHour + 12;
        
        if (start === 0) start = 24;
        if (end === 0) end = 24;
        
        for (let i = start; i < end; i++) {
          const hour = i === 24 ? 0 : i;
          const time12 = hour === 0 ? '12:00 AM' : 
                        hour < 12 ? `${hour}:00 AM` :
                        hour === 12 ? '12:00 PM' :
                        `${hour - 12}:00 PM`;
          slots.push({ time: time12, available: false, court: booking.court });
        }
        return slots;
      });

    const allSlots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const time12 = hour === 0 ? '12:00 AM' : 
                    hour < 12 ? `${hour}:00 AM` :
                    hour === 12 ? '12:00 PM' :
                    `${hour - 12}:00 PM`;
      
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

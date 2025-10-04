
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Advertisement } from '../types';

export const useAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const advertisementsRef = collection(db, 'advertisements');
    const q = query(advertisementsRef, orderBy('title', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const advertisementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Advertisement[];
      setAdvertisements(advertisementsData);
    });

    return () => unsubscribe();
  }, []);

  const addAdvertisement = async (advertisement: Omit<Advertisement, 'id'>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'advertisements'), advertisement);
    } catch (error) {
      console.error('Error adding advertisement:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAdvertisement = async (id: string, updates: Partial<Advertisement>) => {
    setLoading(true);
    try {
      const advertisementRef = doc(db, 'advertisements', id);
      await updateDoc(advertisementRef, updates);
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAdvertisement = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'advertisements', id));
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    advertisements,
    loading,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
  };
};


import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db, firebaseConfig } from '../config/firebase';
import { Advertisement } from '../types';
import { toast } from './use-toast';

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
    }, (error) => {
      console.error('Advertisements snapshot error:', error);
      // diagnostic: log current auth state and project id to help debug permission issues
      try {
        console.debug('Advertisements diagnostic - auth.currentUser:', auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null);
        console.debug('Advertisements diagnostic - projectId:', firebaseConfig?.projectId);
      } catch (dbg) { /* noop */ }

      // show a user-friendly toast for permission errors with a hint
      const msg = error?.message || 'Failed to load advertisements.';
  const hint = (error && (error as { code?: string }).code === 'permission-denied') ? 'تحقق من صلاحيات Firestore (admins أو قواعد القراءة العامة).' : '';
      try { toast({ title: 'خطأ تحميل الإعلانات', description: `${msg} ${hint}`, variant: 'destructive' }); } catch (e) { /* noop */ }
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

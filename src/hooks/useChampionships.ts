
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
import { Championship } from '../types';

export const useChampionships = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const championshipsRef = collection(db, 'championships');
    const q = query(championshipsRef, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const championshipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Championship[];
      setChampionships(championshipsData);
    });

    return () => unsubscribe();
  }, []);

  const addChampionship = async (championship: Omit<Championship, 'id'>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'championships'), championship);
    } catch (error) {
      console.error('Error adding championship:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateChampionship = async (id: string, updates: Partial<Championship>) => {
    setLoading(true);
    try {
      const championshipRef = doc(db, 'championships', id);
      await updateDoc(championshipRef, updates);
    } catch (error) {
      console.error('Error updating championship:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteChampionship = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'championships', id));
    } catch (error) {
      console.error('Error deleting championship:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    championships,
    loading,
    addChampionship,
    updateChampionship,
    deleteChampionship
  };
};

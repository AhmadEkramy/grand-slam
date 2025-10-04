
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
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  };
};

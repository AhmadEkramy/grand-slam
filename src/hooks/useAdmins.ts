import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { toast } from './use-toast';

export interface AdminRecord {
  id: string;
  email: string;
  addedBy?: string;
  createdAt?: string;
}

export const useAdmins = () => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    // wait until auth state is known and user is authenticated before subscribing
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // debug: log auth state and token claims to help debug permission issues
      try {
        console.debug('useAdmins:onAuthStateChanged - user:', user ? { uid: user.uid, email: user.email } : null);
        if (user) {
          // use getIdTokenResult from the auth API to inspect claims
          user.getIdTokenResult()
            .then((res) => console.debug('useAdmins token claims:', res.claims))
            .catch((e) => console.warn('useAdmins failed to getIdTokenResult:', e));
        }
      } catch (e) {
        console.warn('useAdmins auth debug error:', e);
      }
      // if there's already a snapshot subscription, clean it up
      if (unsubscribeSnapshot) {
        try { unsubscribeSnapshot(); } catch (e) { /* noop */ }
        unsubscribeSnapshot = null;
      }

      if (!user) {
        // cannot read admins collection unless authenticated (per rules)
        setAdmins([]);
        return;
      }

      const ref = collection(db, 'admins');
      // add an error handler to avoid uncaught permission errors
      const unsub = onSnapshot(ref, (snapshot) => {
        const data = snapshot.docs.map(d => {
          const docData = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            email: typeof docData.email === 'string' ? docData.email : '',
            addedBy: typeof docData.addedBy === 'string' ? docData.addedBy : undefined,
            createdAt: typeof docData.createdAt === 'string' ? docData.createdAt : undefined,
          } as AdminRecord;
        });
        setAdmins(data);
      }, (error) => {
        console.warn('Admins snapshot error:', error);
        // show a helpful toast to the developer/admin
        try {
          const userInfo = auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null;
          toast({
            title: 'خطأ صلاحية الوصول - admins',
            description: `لا يمكن قراءة قائمة المشرفين. تحقق من أن المستخدم مصدق ولديه صلاحيات. user: ${userInfo ? userInfo.email || userInfo.uid : 'no-user'}`,
            variant: 'destructive'
          });
          console.debug('useAdmins auth.currentUser at error:', userInfo);
        } catch (t) {
          /* noop */
        }
        // keep admins empty on error
        setAdmins([]);
      });

      unsubscribeSnapshot = unsub;
    });

    return () => {
      if (unsubscribeSnapshot) {
        try { unsubscribeSnapshot(); } catch (e) { /* noop */ }
      }
      try { unsubscribeAuth(); } catch (e) { /* noop */ }
    };
  }, []);

  const isAdminByEmail = (email?: string | null) => {
    if (!email) return false;
    return admins.some(a => a.email.toLowerCase() === email.toLowerCase());
  };

  // create admin record; if `id` (uid) is provided, create the doc with that id so
  // it matches the security rule lookup `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
  const addAdmin = async (email: string, addedBy?: string, id?: string) => {
    const payload = { email, addedBy: addedBy || null, createdAt: new Date().toISOString() };
    if (id) {
      // set document with specified id (typically the user's uid)
      await setDoc(doc(db, 'admins', id), payload);
      return id;
    }
    const ref = collection(db, 'admins');
    const created = await addDoc(ref, payload);
    return created.id;
  };

  const removeAdmin = async (id: string) => {
    await deleteDoc(doc(db, 'admins', id));
  };

  const fetchAdminsForEmail = async (email: string) => {
    const q = query(collection(db, 'admins'), where('email', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const docData = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        email: typeof docData.email === 'string' ? docData.email : '',
        addedBy: typeof docData.addedBy === 'string' ? docData.addedBy : undefined,
        createdAt: typeof docData.createdAt === 'string' ? docData.createdAt : undefined,
      } as AdminRecord;
    }) as AdminRecord[];
  };

  return { admins, isAdminByEmail, addAdmin, removeAdmin, fetchAdminsForEmail };
};

export default useAdmins;

// Helper to check admin by uid or email using both admins collection and users/{uid}.isAdmin
export const isAdminUser = async (params: { uid?: string; email?: string }) => {
  const { uid, email } = params;
  try {
    // 1) If uid provided, check admins/{uid} exists
    if (uid) {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      if (adminDoc.exists()) return true;
      // Also check users/{uid}.isAdmin flag
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Record<string, unknown> | undefined;
        if (data && data.isAdmin === true) return true;
      }
    }

    // 2) Fallback to check admins collection by email
    if (email) {
      const q = query(collection(db, 'admins'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) return true;
    }
  } catch (err) {
    console.warn('isAdminUser check failed:', err);
  }
  return false;
};

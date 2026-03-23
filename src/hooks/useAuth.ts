
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db, firebaseConfig } from '../config/firebase';
import { toast } from './use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // ensure there is a Firestore user document for this authenticated user
      if (user) {
        (async () => {
          try {
            const uid = user.uid;
            const userRef = doc(db, 'users', uid);
            const snap = await getDoc(userRef);
            // debug: log auth and token claims before attempting writes
            try {
              console.debug('useAuth: attempting ensure user doc for uid', uid, 'auth.currentUser:', auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null);
              if (auth.currentUser) {
                const t = await auth.currentUser.getIdTokenResult();
                console.debug('useAuth token claims:', t.claims);
              }
            } catch (dbgErr) {
              console.warn('useAuth debug token fetch failed:', dbgErr);
            }
            if (!snap.exists()) {
              // check admins collection for admin flag
              let isAdmin = false;
              try {
                const email = user.email || '';
                if (email) {
                  const q = query(collection(db, 'admins'), where('email', '==', email));
                  const adminSnap = await getDocs(q);
                  if (!adminSnap.empty) isAdmin = true;
                }
              } catch (err) {
                console.warn('Failed to check admins collection on auth state change:', err);
              }

              // refresh id token to ensure the client has up-to-date auth claims
              try {
                // force refresh
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await (user.getIdToken ? user.getIdToken(true) : Promise.resolve());
              } catch (tknErr) {
                console.warn('Failed to refresh ID token before creating user doc:', tknErr);
              }

              await setDoc(userRef, {
                uid,
                email: user.email || '',
                displayName: user.displayName || '',
                createdAt: new Date().toISOString(),
                isAdmin
              });
            } else {
              // keep user doc up-to-date (merge to avoid overwriting createdAt)
              try {
                await (user.getIdToken ? user.getIdToken(true) : Promise.resolve());
              } catch (tknErr) {
                console.warn('Failed to refresh ID token before merging user doc:', tknErr);
              }

              await setDoc(userRef, {
                email: user.email || '',
                displayName: user.displayName || ''
              }, { merge: true });
            }
          } catch (err) {
            console.warn('Failed to ensure user document exists in Firestore:', err);
            try {
              const userInfo = auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null;
              toast({
                title: 'خطأ صلاحية الوصول - users',
                description: `تعذر إنشاء/تحديث مستند المستخدم. تحقق من قواعد Firestore أو صلاحيات الحساب. user: ${userInfo ? userInfo.email || userInfo.uid : 'no-user'}`,
                variant: 'destructive'
              });
              console.debug('useAuth auth.currentUser at error:', userInfo);
            } catch (t) { /* noop */ }
          }
        })();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // diagnostic: log which project and key the client is using (projectId only)
      try { console.debug('signIn diagnostic - projectId:', firebaseConfig?.projectId, 'auth.currentUser pre-signin:', auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null); } catch (d) { /* noop */ }
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      // Log full error details and provide a clearer hint for common causes
      try {
        console.error('Error signing in:', error);
        const errObj = error as { code?: string; message?: string } | undefined;
        const code = errObj?.code || 'unknown';
        const message = errObj?.message || String(error);
        // Common actionable hints
        let hint = '';
        if (code === 'auth/invalid-credential') {
          hint = 'Invalid credentials or authentication configuration. Ensure Email/Password sign-in is enabled in Firebase Console and that the API key/project are correct.';
        } else if (code === 'auth/network-request-failed') {
          hint = 'Network error. Check your connection.';
        }
        const userMessage = `${message}${hint ? ' — ' + hint : ''}`;
        const out = new Error(userMessage) as Error & { code?: string };
        out.code = code;
        throw out;
      } catch (logErr) {
        // if something goes wrong while processing error, rethrow the original
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        try {
          await updateProfile(result.user, { displayName });
        } catch (err) {
          console.warn('Failed to set displayName on signUp:', err);
        }
      }
      // Determine if this email is listed in admins collection
      let isAdmin = false;
      try {
        const email = result.user.email || '';
        if (email) {
          const q = query(collection(db, 'admins'), where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) isAdmin = true;
        }
      } catch (err) {
        console.warn('Failed to check admins collection:', err);
      }

      // Create a user document in Firestore under users/{uid}
      try {
        const uid = result.user.uid;
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: result.user.email || '',
          displayName: displayName || result.user.displayName || '',
          createdAt: new Date().toISOString(),
          isAdmin
        });
      } catch (err) {
        console.warn('Failed to create user doc in Firestore:', err);
      }
      return result.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout
  };
};

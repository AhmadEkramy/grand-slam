
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMnOeazx_3waaXe-RoL4HDzB_SraPrKdg",
  authDomain: "padel-grand-slam-new.firebaseapp.com",
  projectId: "padel-grand-slam-new",
  storageBucket: "padel-grand-slam-new.firebasestorage.app",
  messagingSenderId: "114968771007",
  appId: "1:114968771007:web:dcf89ccf84c4de289d090a",
  measurementId: "G-5WNCNSWP3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Export the raw config so callers can log/inspect which project the client is pointed at
export { firebaseConfig };

  export { analytics, app, auth, db };



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlDNN4HAFEgpnu8Ba7GqNmsI47Fkno3sI",
  authDomain: "padel-grand-slam.firebaseapp.com",
  projectId: "padel-grand-slam",
  storageBucket: "padel-grand-slam.firebasestorage.app",
  messagingSenderId: "229535146726",
  appId: "1:229535146726:web:82daac31c88a1b508dd127",
  measurementId: "G-C2JCW5PFNX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };

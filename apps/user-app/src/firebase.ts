import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBcqkX0mesafA3GkLqZEiiB45CUsqsZVps",
  authDomain: "etegah-4c040.firebaseapp.com",
  projectId: "etegah-4c040",
  storageBucket: "etegah-4c040.appspot.com",
  messagingSenderId: "63353908823",
  appId: "1:63353908823:web:91297743b7919ca5703d12",
  measurementId: "G-7CGGRKCP8X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, GoogleAuthProvider, signInWithPopup, onAuthStateChanged };
export type { User };

// Firebase configuration for Direction Indoor Navigation System
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBcqkX0mesafA3GkLqZEiiB45CUsqsZVps",
  authDomain: "etegah-4c040.firebaseapp.com",
  projectId: "etegah-4c040",
  storageBucket: "etegah-4c040.firebasestorage.app",
  messagingSenderId: "63353908823",
  appId: "1:63353908823:web:91297743b7919ca5703d12",
  measurementId: "G-7CGGRKCP8X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

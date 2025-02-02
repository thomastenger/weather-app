// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
export { updateDoc };

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaHtQhNAgb5KVy75ZqiJ423ppO40d_ftE",
  authDomain: "weatheapp-269d0.firebaseapp.com",
  projectId: "weatheapp-269d0",
  storageBucket: "weatheapp-269d0.firebasestorage.app",
  messagingSenderId: "851643018997",
  appId: "1:851643018997:web:fcb8eb38a8536478911fbc",
  measurementId: "G-WJPG7JJRN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
export { db };
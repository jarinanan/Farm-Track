// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAB6YsPKCzvdC3IYf-Kjxgs3ORx7EOqGeM",
  authDomain: "farm-track-b17f9.firebaseapp.com",
  projectId: "farm-track-b17f9",
  storageBucket: "farm-track-b17f9.firebasestorage.app",
  messagingSenderId: "838136954521",
  appId: "1:838136954521:web:6967adac3146cf4d4e0208",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

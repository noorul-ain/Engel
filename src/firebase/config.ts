import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_F6zA-Ft4shhfsdHh6sjQZlfW0BMXG9A",
  authDomain: "engle-394c3.firebaseapp.com",
  projectId: "engle-394c3",
  storageBucket: "engle-394c3.firebasestorage.app",
  messagingSenderId: "48964822764",
  appId: "1:48964822764:web:9f121e7851d1f2d0eca7c9",
  measurementId: "G-C9ZNZH4P9T",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
const analytics =
  typeof window !== "undefined"
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : null;

export { app, db, storage, analytics };

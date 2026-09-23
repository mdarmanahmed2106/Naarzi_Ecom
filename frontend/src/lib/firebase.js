import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB77n6VE84t3y-SDXVYhfsggVaEl4lGzks",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "naarzi.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "naarzi",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "naarzi.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "989715348323",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:989715348323:web:db2f143e4a7bd7dd03b156",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-T8M6M10XVF"
};

// Initialize Firebase (singleton pattern for Next.js Fast Refresh)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Analytics safely (client-side only for Next.js SSR)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
export default app;

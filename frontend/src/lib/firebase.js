import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB77n6VE84t3y-SDXVYhfsggVaEl4lGzks",
  authDomain: "naarzi.firebaseapp.com",
  projectId: "naarzi",
  storageBucket: "naarzi.firebasestorage.app",
  messagingSenderId: "989715348323",
  appId: "1:989715348323:web:db2f143e4a7bd7dd03b156",
  measurementId: "G-T8M6M10XVF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ind-estste.firebaseapp.com",
  projectId: "ind-estste",
  storageBucket: "ind-estste.appspot.com",
  messagingSenderId: "264620247123",
  appId: "1:264620247123:web:f70eba01e0827c1ffbdea6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
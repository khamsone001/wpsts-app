// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyArmUZZetFfZVnBkX_mNdGOWDNmP3ULBdI",
    authDomain: "wpstsmanagement.firebaseapp.com",
    projectId: "wpstsmanagement",
    storageBucket: "wpstsmanagement.firebasestorage.app",
    messagingSenderId: "1065611352218",
    appId: "1:1065611352218:web:dfdffd8ee9c446c2b4a723",
    measurementId: "G-Z06VGRCBN2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);

// Set this to false to use real Firebase
export const IS_MOCK_MODE = false; 

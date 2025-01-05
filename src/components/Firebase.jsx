// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FB_APP_ID,
    measurementId: import.meta.env.VITE_FB_MESSUREMENT_ID,
};
// const storageConfig = {
//     apiKey: import.meta.env.VITE_FB_API_KEY2,
//     authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN2,
//     projectId: import.meta.env.VITE_FB_PROJECT_ID2,
//     storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET2,
//     messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID2,
//     appId: import.meta.env.VITE_FB_APP_ID2,
//     measurementId: import.meta.env.VITE_FB_MESSUREMENT_ID2,
// };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const storageApp = initializeApp(storageConfig);
// export const storage = getStorage(storageApp);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
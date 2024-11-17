// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyAJPB2C4MjaQ9-dns1OT6HYYbATO17gb60",
    authDomain: "tinkfast-b7490.firebaseapp.com",
    projectId: "tinkfast-b7490",
    storageBucket: "tinkfast-b7490.firebasestorage.app",
    messagingSenderId: "675584860783",
    appId: "1:675584860783:web:314ef0579ce630eb9fa39a",
    measurementId: "G-83FYEYGYGJ"
};


// const firebaseConfig = {
//     apiKey: "AIzaSyAMBkerf2V7j5gia1GAyHFMu931fglWDD4",
//     authDomain: "tinkfast-cba10.firebaseapp.com",
//     projectId: "tinkfast-cba10",
//     storageBucket: "tinkfast-cba10.appspot.com",
//     messagingSenderId: "928354136348",
//     appId: "1:928354136348:web:ed40c490756c9f1ee30ad9",
//     measurementId: "G-HYDVC2TZ8C"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
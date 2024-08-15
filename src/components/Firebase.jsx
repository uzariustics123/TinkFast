// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAMBkerf2V7j5gia1GAyHFMu931fglWDD4",
    authDomain: "tinkfast-cba10.firebaseapp.com",
    projectId: "tinkfast-cba10",
    storageBucket: "tinkfast-cba10.appspot.com",
    messagingSenderId: "928354136348",
    appId: "1:928354136348:web:ed40c490756c9f1ee30ad9",
    measurementId: "G-HYDVC2TZ8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
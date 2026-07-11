import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",

  authDomain: "pantoja-phone-imports.firebaseapp.com",

  projectId: "pantoja-phone-imports",

  storageBucket: "pantoja-phone-imports.firebasestorage.app",

  messagingSenderId: "455745095069",

  appId: "1:455745095069:web:9570433372eb70ea221b74",

  measurementId: "G-BE7MNR59XF",

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);
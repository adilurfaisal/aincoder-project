// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDI_vBC2V2MNrHPJpKZ3QPF2xasCvlZHM",
  authDomain: "aincoder-project.firebaseapp.com",
  projectId: "aincoder-project",
  storageBucket: "aincoder-project.appspot.com",
  messagingSenderId: "165955257440",
  appId: "1:165955257440:web:67702229e7cf844a412f05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

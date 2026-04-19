import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3cIixycxSc_J91RObQ0KxUd2d_00XXeY",
  authDomain: "erosopranos.firebaseapp.com",
  databaseURL: "https://erosopranos-default-rtdb.firebaseio.com",
  projectId: "erosopranos",
  storageBucket: "erosopranos.firebasestorage.app",
  messagingSenderId: "681678955359",
  appId: "1:681678955359:web:81ca26ce61dd2744ddccea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAmZ5mU5k0GEC5RJj4-0PwRF8vpFUF3464",
  authDomain: "getaiinterview.firebaseapp.com",
  projectId: "getaiinterview",
  storageBucket: "getaiinterview.firebasestorage.app",
  messagingSenderId: "873681451015",
  appId: "1:873681451015:web:493f74efef10a47eb612a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBCFCIwTXNsg5OcFuvZ0vwO-vUKESMapKY",
    authDomain: "personal-d59e9.firebaseapp.com",
    databaseURL: "https://personal-d59e9-default-rtdb.firebaseio.com",
    projectId: "personal-d59e9",
    storageBucket: "personal-d59e9.firebasestorage.app",
    messagingSenderId: "142182051083",
    appId: "1:142182051083:web:4051b1f357af2c6de9860e",
    measurementId: "G-7BRQ0140RM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };

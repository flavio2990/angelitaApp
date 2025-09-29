import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIMLUf5yxWFcBXxxsV63Mccv_4P6JFmHE",
  authDomain: "recidenciasapp.firebaseapp.com",
  projectId: "recidenciasapp",
  storageBucket: "recidenciasapp.appspot.com",
  messagingSenderId: "844528127037",
  appId: "1:844528127037:android:a65d1d457915fc181dee54", // â† App ID para app.hogares
  databaseURL: "https://recidenciasapp-default-rtdb.firebaseio.com"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const database = getDatabase(app);

export { auth, database, app };
export const FIREBASE_DB_URL = "https://recidenciasapp-default-rtdb.firebaseio.com";
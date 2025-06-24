import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIMLUf5yxWFcBXxxsV63Mccv_4P6JFmHE",
  authDomain: "recidenciasapp.firebaseapp.com",
  projectId: "recidenciasapp",
  storageBucket: "recidenciasapp.appspot.com",
  messagingSenderId: "844528127037",
  appId: "1:844528127037:android:159900d40f776f1d1dee54"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export const FIREBASE_DB_URL = "https://recidenciasapp-default-rtdb.firebaseio.com/";
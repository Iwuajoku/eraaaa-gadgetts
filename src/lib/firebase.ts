import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseAppConfig = {
  projectId: "zeta-geode-441j7",
  appId: "1:814022750051:web:fdd4bb12e523bef6dfad56",
  apiKey: "AIzaSyD9AeVvxJPO_H_NBOpNiFidJKYHmulZ0WU",
  authDomain: "zeta-geode-441j7.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-eraaaagadgetts-d84d24c3-e70a-4592-9ba1-95fd4a60f9eb",
  storageBucket: "zeta-geode-441j7.firebasestorage.app",
  messagingSenderId: "814022750051",
  measurementId: "",
  oAuthClientId: "814022750051-i7eg8to6d1es2770ndu5jtalevaar9ic.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = !getApps().length ? initializeApp(firebaseAppConfig) : getApp();

export const firestoreDb = firebaseAppConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseAppConfig.firestoreDatabaseId)
  : getFirestore(app);

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

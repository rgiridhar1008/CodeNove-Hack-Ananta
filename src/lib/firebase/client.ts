
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';

// This is a public configuration and it's safe to expose.
const firebaseConfig: FirebaseOptions = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

function getFirebaseApp() {
  if (getApps().length) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

export { getFirebaseApp };

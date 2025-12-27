
'use client';

import { createContext, type ReactNode } from 'react';
import { getFirebaseApp } from './client';
import { type FirebaseApp } from 'firebase/app';

export const FirebaseContext = createContext<{
  app: FirebaseApp;
}>({
  app: getFirebaseApp(),
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const app = getFirebaseApp();

  return (
    <FirebaseContext.Provider value={{ app }}>
      {children}
    </FirebaseContext.Provider>
  );
}

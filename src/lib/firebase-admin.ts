
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

const firestoreAdmin = admin.firestore();

export { admin, firestoreAdmin };
export type User = {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
  isSearching?: boolean;
  isChatting?: boolean;
  blocked?: string[];
  karma?: number;
  age?: number;
  gender?: string;
};

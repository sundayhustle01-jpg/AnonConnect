
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
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

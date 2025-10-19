'use server';

import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { User, firestoreAdmin } from '@/lib/firebase-admin';
import type { SearchFilters, UserProfile } from '@/lib/types';

const ACTIVE_USERS_COLLECTION = 'activeUsers';
const USERS_COLLECTION = 'users';

async function blockUser(userId: string, strangerId: string) {
    try {
        const userRef = firestoreAdmin.collection(USERS_COLLECTION).doc(userId);
        await userRef.update({
            blocked: FieldValue.arrayUnion(strangerId),
        });
    } catch (error) {
        console.error('Error in blockUser:', error);
        throw error;
    }
}

async function reportUser(userId: string, strangerId: string) {
    try {
        const reportRef = firestoreAdmin.collection('reports').doc();
        await reportRef.set({
            reporterId: userId,
            reportedId: strangerId,
            timestamp: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error in reportUser:', error);
        throw error;
    }
}

async function handleChatEnd(userId: string, strangerId: string, durationInSeconds: number) {
    try {
        const userRef = firestoreAdmin.collection(USERS_COLLECTION).doc(userId);
        const strangerRef = firestoreAdmin.collection(USERS_COLLECTION).doc(strangerId);

        const karmaGain = Math.round(durationInSeconds / 60); // 1 karma point per minute of chat

        await userRef.update({ karma: FieldValue.increment(karmaGain) });
        await strangerRef.update({ karma: FieldValue.increment(karmaGain) });
    } catch (error) {
        console.error('Error in handleChatEnd:', error);
        throw error;
    }
}

export { blockUser, reportUser, handleChatEnd };

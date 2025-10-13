'use server';

import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { User, firestoreAdmin } from '@/lib/firebase-admin';
import type { SearchFilters, UserProfile } from '@/lib/types';

const ACTIVE_USERS_COLLECTION = 'activeUsers';
const USERS_COLLECTION = 'users';

async function findStranger(filters: SearchFilters, userId?: string): Promise<{ stranger: UserProfile, match: boolean }> {
    const activeUsers = await firestoreAdmin.collection(ACTIVE_USERS_COLLECTION).get();
    let availableUsers = activeUsers.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(user => user.id !== userId && !user.isSearching && !user.isChatting);

    if (userId) {
        const currentUser = await firestoreAdmin.collection(USERS_COLLECTION).doc(userId).get();
        const blocked = currentUser.data()?.blocked ?? [];
        availableUsers = availableUsers.filter(user => !blocked.includes(user.id));
    }

    let match = false;
    if (Object.keys(filters).length > 0) {
        const filteredUsers = availableUsers.filter(user => {
            if (filters.gender && user.gender && filters.gender !== user.gender) return false;
            if (filters.ageRange && user.age) {
                const [min, max] = filters.ageRange;
                if (user.age < min || user.age > max) return false;
            }
            return true;
        });

        if (filteredUsers.length > 0) {
            availableUsers = filteredUsers;
            match = true;
        }
    }

    if (availableUsers.length > 0) {
        const stranger = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        return { stranger, match };
    }
    
    // Fallback: return a bot if no users are available
    return {
        stranger: {
            id: 'bot',
            username: 'CasualFriday Bot',
            avatar: 'https://i.pravatar.cc/150?u=bot',
            online: true,
        },
        match: false
    };
}

async function blockUser(userId: string, strangerId: string) {
    const userRef = firestoreAdmin.collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
        blocked: FieldValue.arrayUnion(strangerId),
    });
}

async function reportUser(userId: string, strangerId: string) {
    const reportRef = firestoreAdmin.collection('reports').doc();
    await reportRef.set({
        reporterId: userId,
        reportedId: strangerId,
        timestamp: FieldValue.serverTimestamp(),
    });
}

async function handleChatEnd(userId: string, strangerId: string, durationInSeconds: number) {
    const userRef = firestoreAdmin.collection(USERS_COLLECTION).doc(userId);
    const strangerRef = firestoreAdmin.collection(USERS_COLLECTION).doc(strangerId);

    const karmaGain = Math.round(durationInSeconds / 60); // 1 karma point per minute of chat

    await userRef.update({ karma: FieldValue.increment(karmaGain) });
    await strangerRef.update({ karma: FieldValue.increment(karmaGain) });
}

export { findStranger, blockUser, reportUser, handleChatEnd };

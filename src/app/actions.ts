'use server';

import type { UserProfile, Message, SearchFilters } from '@/lib/types';
import { allStrangers } from '@/lib/strangers';

import type { Message, SearchFilters, UserProfile } from '@/lib/types';

const randomReplies = [
  "That's interesting!", "Tell me more.", "I see.", "Hmm, what do you mean by that?",
  "Could you elaborate?", "I'm not sure I understand. Can you explain it differently?",
  "Wow, really?", "That's cool.", "Got it.", "Why do you say that?",
  "What makes you think that?", "I've never thought about it that way before.", "That's a good point.", "I'm not so sure about that.",
  "Can you give me an example?",
];

const imageReplies = [
    "Nice picture!",
    "Cool image!",
    "What's this a picture of?",
    "I like this picture.",
]

// In-memory queue for users waiting for a chat
const waitingQueue: string[] = [];

export async function sendMessage(
  messageText: string,
  userAvatar: string,
  strangerAvatar: string,
  image?: string
): Promise<{ userMessage: Message; strangerMessage: Message } | { error: string }> {
  if (!messageText.trim() && !image) {
    return { error: 'Message cannot be empty.' };
  }

  try {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: messageText,
      image: image,
      sender: 'user',
      timestamp: Date.now(),
      avatar: userAvatar,
    };

    const replyText = image 
        ? imageReplies[Math.floor(Math.random() * imageReplies.length)]
        : randomReplies[Math.floor(Math.random() * randomReplies.length)];

    const strangerMessage: Message = {
      id: crypto.randomUUID(),
      text: replyText,
      image: undefined, 
      sender: 'stranger',
      timestamp: Date.now() + 500, // Slightly delayed
      avatar: strangerAvatar,
    };

    return { userMessage, strangerMessage };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Failed to process message. Please try again.' };
  }
}

export async function joinQueue(userId: string): Promise<{ matchedUserId?: string }> {
  if (waitingQueue.includes(userId)) {
    return {}; // User is already in the queue
  }

  const matchedUserId = waitingQueue.shift(); // Get the first user from the queue
  if (matchedUserId) {
    return { matchedUserId }; // Return the matched user ID
  }

  waitingQueue.push(userId); // Add the current user to the queue
  return {}; // No match found yet
}

export async function findStranger(
  filters: SearchFilters,
  currentUserId?: string
): Promise<{ stranger: UserProfile; match: boolean }> {
  const availableStrangers = allStrangers.filter(s => s.id !== currentUserId && s.online && !s.isBanned);

  const getKarmaSortedStranger = (strangers: UserProfile[]) => {
    if (!currentUser || !currentUser.karma) {
      return strangers[Math.floor(Math.random() * strangers.length)];
    }
    strangers.sort((a, b) => {
        const karmaA = a.karma || 0;
        const karmaB = b.karma || 0;
        const diffA = Math.abs(karmaA - (currentUser.karma || 0));
        const diffB = Math.abs(karmaB - (currentUser.karma || 0));
        return diffA - diffB;
    });
    const topMatches = strangers.slice(0, 3);
    return topMatches[Math.floor(Math.random() * topMatches.length)];
  };

  const currentUser = allStrangers.find(u => u.id === currentUserId);

  // 1. Check the queue for a waiting user
  let matchedUserIdFromQueue: string | undefined;
  if (waitingQueue.length > 0) {
    // Find a suitable user in the queue considering filters (optional but good)
    matchedUserIdFromQueue = waitingQueue.find(queueUserId => {
      const queueUser = allStrangers.find(u => u.id === queueUserId);
      if (!queueUser || queueUser.id === currentUserId) return false;

      // Add filter checks here if needed (similar to the filtering below)
      // For simplicity, we'll just check if the user is online and not banned
      return queueUser.online && !queueUser.isBanned;
    });

    if (matchedUserIdFromQueue) {
      waitingQueue.splice(waitingQueue.indexOf(matchedUserIdFromQueue), 1); // Remove from queue
      const stranger = allStrangers.find(u => u.id === matchedUserIdFromQueue)!;
      return { stranger, match: true }; // Matched from queue
    }
  }
  const unblockedStrangers = availableStrangers.filter(s => 
    !currentUser?.blockedUserIds?.includes(s.id) && !s.blockedUserIds?.includes(currentUser?.id || '')
  );

  const filtered = unblockedStrangers.filter(stranger => {
    const ageMatch =
      filters.minAge && filters.maxAge && stranger.age
        ? stranger.age >= filters.minAge && stranger.age <= filters.maxAge
        : true;

    const genderMatch =
      filters.gender && filters.gender !== 'any' ? stranger.gender === filters.gender : true;

    const locationMatch = filters.location
      ? stranger.location?.toLowerCase().includes(filters.location.toLowerCase())
      : true;

    return ageMatch && genderMatch && locationMatch;
  });

  if (filtered.length > 0) {
    const stranger = getKarmaSortedStranger(filtered);
    return { stranger, match: true };
  }
  
  const allAvailableStrangers = allStrangers.filter(s => s.id !== currentUserId && !s.isBanned);

  if (unblockedStrangers.length > 0) {
    const randomStranger = getKarmaSortedStranger(unblockedStrangers);
    return { stranger: randomStranger, match: false };
  }
  
  const randomStranger = allAvailableStrangers[Math.floor(Math.random() * allAvailableStrangers.length)];
  return { stranger: randomStranger || allStrangers[0], match: false };
}

export async function handleChatEnd(userId: string, strangerId: string, durationInSeconds: number) {
    const user = allStrangers.find(u => u.id === userId);
    const stranger = allStrangers.find(u => u.id === strangerId);

    if (!user || !stranger) return;

    if (durationInSeconds > 300) { // 5 minutes
        updateKarma(userId, 5);
        updateKarma(strangerId, 5);
    } else if (durationInSeconds < 30) { // 30 seconds
        updateKarma(userId, -2);
    }
}

export async function updateKarma(userId: string, karmaChange: number): Promise<UserProfile | null> {
    const user = allStrangers.find(u => u.id === userId);
    if (user) {
        user.karma = (user.karma || 0) + karmaChange;
        return user;
    }
    return null;
}

export async function blockUser(userId: string, blockedUserId: string): Promise<UserProfile | null> {
    const user = allStrangers.find(u => u.id === userId);
    if (user) {
        if (!user.blockedUserIds) {
            user.blockedUserIds = [];
        }
        user.blockedUserIds.push(blockedUserId);
        updateKarma(userId, 2);
        updateKarma(blockedUserId, -15);
        return user;
    }
    return null;
}

export async function reportUser(reporterId: string, reportedUserId: string): Promise<UserProfile | null> {
    const user = allStrangers.find(u => u.id === reportedUserId);
    if (user) {
        user.reportedCount = (user.reportedCount || 0) + 1;
        if (user.reportedCount > 5) { // Ban after 5 reports
            user.isBanned = true;
        }
        updateKarma(reporterId, 5);
        updateKarma(reportedUserId, -25);
        return user;
    }
    return null;
}

export async function isBlocked(userId: string, strangerId: string): Promise<boolean> {
    const user = allStrangers.find(u => u.id === userId);
    const stranger = allStrangers.find(u => u.id === strangerId);
    if (user && user.blockedUserIds?.includes(strangerId)) {
        return true;
    }
    if (stranger && stranger.blockedUserIds?.includes(userId)) {
        return true;
    }
    return false;
}

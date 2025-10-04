'use server';

import { filterProfanity } from '@/ai/flows/profanity-filter';
import type { Message, SearchFilters, UserProfile } from '@/lib/types';
import { allStrangers } from '@/lib/strangers';

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
    const filteredResult = await filterProfanity({ text: messageText });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: filteredResult.filteredText,
      image: image,
      sender: 'user',
      timestamp: Date.now(),
      avatar: userAvatar,
    };

    // Simulate stranger's reply
    const strangerMessage: Message = {
      id: crypto.randomUUID(),
      text: `Echo: ${filteredResult.filteredText}`, // Echoes the filtered message
      image: image, // Echoes the image
      sender: 'stranger',
      timestamp: Date.now() + 500, // Slightly delayed
      avatar: strangerAvatar,
    };

    return { userMessage, strangerMessage };
  } catch (error) {
    console.error('AI profanity filter failed:', error);
    return { error: 'Failed to process message. Please try again.' };
  }
}

export async function findStranger(
  filters: SearchFilters,
  currentUserId?: string
): Promise<{ stranger: UserProfile; match: boolean }> {
  const availableStrangers = allStrangers.filter(s => s.id !== currentUserId && s.online);

  const filtered = availableStrangers.filter(stranger => {
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
    const stranger = filtered[Math.floor(Math.random() * filtered.length)];
    return { stranger, match: true };
  }
  
  const allAvailableStrangers = allStrangers.filter(s => s.id !== currentUserId);

  // Fallback to any random online stranger if no filter match
  if (availableStrangers.length > 0) {
    const randomStranger = availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
    return { stranger: randomStranger, match: false };
  }
  
  // Fallback to any random stranger if no one is online
  const randomStranger = allAvailableStrangers[Math.floor(Math.random() * allAvailableStrangers.length)];
  return { stranger: randomStranger || allStrangers[0], match: false };
}

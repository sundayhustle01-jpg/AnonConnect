'use server';

import { filterProfanity } from '@/ai/flows/profanity-filter';
import type { Message } from '@/lib/types';

export async function sendMessage(
  messageText: string,
  userAvatar: string,
  strangerAvatar: string
): Promise<{ userMessage: Message; strangerMessage: Message } | { error: string }> {
  if (!messageText.trim()) {
    return { error: 'Message cannot be empty.' };
  }

  try {
    const filteredResult = await filterProfanity({ text: messageText });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: filteredResult.filteredText,
      sender: 'user',
      timestamp: Date.now(),
      avatar: userAvatar,
    };

    // Simulate stranger's reply
    const strangerMessage: Message = {
      id: crypto.randomUUID(),
      text: filteredResult.filteredText, // Echoes the filtered message
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

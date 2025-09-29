'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const USER_STORAGE_KEY = 'anon-connect-user';
const STRANGERS_HISTORY_KEY = 'anon-connect-strangers-history';

const userAvatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));

const createDefaultUser = (): UserProfile => ({
  id: crypto.randomUUID(),
  username: '',
  avatar: userAvatars.length > 0 ? userAvatars[0].imageUrl : 'https://picsum.photos/seed/avatar1/100/100',
});

const MAX_HISTORY_LENGTH = 5;

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [strangersHistory, setStrangersHistory] = useState<UserProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id && parsedUser.username !== undefined && parsedUser.avatar) {
          setUser(parsedUser);
        } else {
            const defaultUser = createDefaultUser();
            setUser(defaultUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
        }
      } else {
        const defaultUser = createDefaultUser();
        setUser(defaultUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }

      const storedHistory = localStorage.getItem(STRANGERS_HISTORY_KEY);
      if(storedHistory) {
        setStrangersHistory(JSON.parse(storedHistory));
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setUser(createDefaultUser());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateUser = useCallback((newProfileData: Partial<Omit<UserProfile, 'id'>>) => {
    setUser(prevUser => {
      const updatedUser: UserProfile = { 
          id: prevUser?.id || crypto.randomUUID(),
          username: newProfileData.username ?? prevUser?.username ?? '',
          avatar: newProfileData.avatar ?? prevUser?.avatar ?? '',
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const addStrangerToHistory = useCallback((stranger: UserProfile) => {
    setStrangersHistory(prevHistory => {
        const newHistory = [stranger, ...prevHistory.filter(s => s.id !== stranger.id)].slice(0, MAX_HISTORY_LENGTH);
        localStorage.setItem(STRANGERS_HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
    });
  }, []);

  return { user, updateUser, isLoaded, strangersHistory, addStrangerToHistory };
}

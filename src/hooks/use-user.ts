'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const USER_STORAGE_KEY = 'anon-connect-user';
const LAST_STRANGER_KEY = 'anon-connect-last-stranger';

const userAvatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));

const createDefaultUser = (): UserProfile => ({
  id: crypto.randomUUID(),
  username: '',
  avatar: userAvatars.length > 0 ? userAvatars[0].imageUrl : 'https://picsum.photos/seed/avatar1/100/100',
});

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lastStranger, setLastStranger] = useState<UserProfile | null>(null);
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

      const storedStranger = localStorage.getItem(LAST_STRANGER_KEY);
      if(storedStranger) {
        setLastStranger(JSON.parse(storedStranger));
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

  const updateLastStranger = useCallback((stranger: UserProfile | null) => {
    setLastStranger(stranger);
    if (stranger) {
      localStorage.setItem(LAST_STRANGER_KEY, JSON.stringify(stranger));
    } else {
      localStorage.removeItem(LAST_STRANGER_KEY);
    }
  }, []);

  return { user, updateUser, isLoaded, lastStranger, updateLastStranger };
}

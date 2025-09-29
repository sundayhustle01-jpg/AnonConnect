'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const USER_STORAGE_KEY = 'anon-connect-user';

const createDefaultUser = (): UserProfile => ({
  id: crypto.randomUUID(),
  username: '',
  avatar: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl || 'https://picsum.photos/seed/avatar1/100/100',
});

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const defaultUser = createDefaultUser();
        setUser(defaultUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setUser(createDefaultUser());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateUser = useCallback((newProfileData: Partial<UserProfile>) => {
    setUser(prevUser => {
      const updatedUser = { ...(prevUser || createDefaultUser()), ...newProfileData };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return { user, updateUser, isLoaded };
}

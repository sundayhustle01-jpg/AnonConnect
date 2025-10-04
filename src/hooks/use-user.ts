
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { allStrangers } from '@/lib/strangers';

const USER_STORAGE_KEY = 'anon-connect-user';
const STRANGERS_HISTORY_KEY = 'anon-connect-strangers-history';

const userAvatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));

const createDefaultUser = (): UserProfile => ({
  id: crypto.randomUUID(),
  username: '',
  avatar: userAvatars.length > 0 ? userAvatars[0].imageUrl : 'https://picsum.photos/seed/avatar1/100/100',
  age: undefined,
  gender: undefined,
  location: undefined,
  favoriteIds: [],
});

const MAX_HISTORY_LENGTH = 5;

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [strangersHistory, setStrangersHistory] = useState<UserProfile[]>([]);
  const [favorites, setFavorites] = useState<UserProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      let currentUser: UserProfile;
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id) {
            currentUser = { ...createDefaultUser(), ...parsedUser };
            setUser(currentUser);
        } else {
            currentUser = createDefaultUser();
            setUser(currentUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }
      } else {
        currentUser = createDefaultUser();
        setUser(currentUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      }
      
      const favoriteStrangers = allStrangers.filter(s => currentUser.favoriteIds?.includes(s.id));
      setFavorites(favoriteStrangers);

      const storedHistory = localStorage.getItem(STRANGERS_HISTORY_KEY);
      if(storedHistory) {
        setStrangersHistory(JSON.parse(storedHistory));
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      const defaultUser = createDefaultUser();
      setUser(defaultUser);
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
          age: newProfileData.age ?? prevUser?.age,
          gender: newProfileData.gender ?? prevUser?.gender,
          location: newProfileData.location ?? prevUser?.location,
          favoriteIds: newProfileData.favoriteIds ?? prevUser?.favoriteIds ?? [],
      };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Failed to save user to localStorage:", error);
      }
      return updatedUser;
    });
  }, []);

  const addStrangerToHistory = useCallback((stranger: UserProfile) => {
    setStrangersHistory(prevHistory => {
        const newHistory = [stranger, ...prevHistory.filter(s => s.id !== stranger.id)].slice(0, MAX_HISTORY_LENGTH);
        try {
            localStorage.setItem(STRANGERS_HISTORY_KEY, JSON.stringify(newHistory));
        } catch(error) {
            console.error("Failed to save stranger history to localStorage:", error);
        }
        return newHistory;
    });
  }, []);

  const logout = useCallback(() => {
    try {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(STRANGERS_HISTORY_KEY);
        const defaultUser = createDefaultUser();
        setUser(defaultUser);
        setStrangersHistory([]);
        setFavorites([]);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
    } catch(error) {
        console.error("Failed to logout:", error);
        // still reset state even if localstorage fails
        const defaultUser = createDefaultUser();
        setUser(defaultUser);
        setStrangersHistory([]);
        setFavorites([]);
    }
  }, []);
  
  const addFavorite = useCallback((strangerId: string) => {
    if (!user) return;
    const newFavoriteIds = [...(user.favoriteIds || []), strangerId];
    updateUser({ favoriteIds: newFavoriteIds });
    const stranger = allStrangers.find(s => s.id === strangerId);
    if (stranger) {
        setFavorites(prev => [...prev, stranger]);
    }
  }, [user, updateUser]);

  const removeFavorite = useCallback((strangerId: string) => {
    if (!user) return;
    const newFavoriteIds = (user.favoriteIds || []).filter(id => id !== strangerId);
    updateUser({ favoriteIds: newFavoriteIds });
    setFavorites(prev => prev.filter(s => s.id !== strangerId));
  }, [user, updateUser]);
  
  const isFavorite = useCallback((strangerId: string) => {
      return user?.favoriteIds?.includes(strangerId) ?? false;
  }, [user]);


  return { user, updateUser, isLoaded, strangersHistory, addStrangerToHistory, logout, favorites, addFavorite, removeFavorite, isFavorite };
}

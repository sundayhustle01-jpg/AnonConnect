export type UserProfile = {
    id: string;
    username: string;
    avatar: string;
    online: boolean;
    isSearching?: boolean;
    isChatting?: boolean;
    blocked?: string[];
    karma?: number;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    location?: string;
    favoriteIds?: string[];
  };
  
  export type Message = {
    id: string;
    text?: string;
    image?: string;
    senderId: string;
    avatar: string;
    timestamp: any;
  };
  
  export type SearchFilters = {
    gender?: string;
    ageRange?: [number, number];
  };
  
export type UserProfile = {
  id: string;
  username: string;
  avatar: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  location?: string;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'stranger';
  timestamp: number;
  avatar: string;
};

export type UserProfile = {
  id: string;
  username: string;
  avatar: string;
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'stranger';
  timestamp: number;
  avatar: string;
};

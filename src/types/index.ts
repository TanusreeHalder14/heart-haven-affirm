export interface User {
  id: string;
  email: string;
  name: string;
}

export interface GratitudeEntry {
  id: string;
  content: string;
  category: 'Health' | 'Relationships' | 'Self' | 'Work';
  emoji?: string;
  date: string;
  userId: string;
  isAnonymous?: boolean;
  author?: string;
  likes?: number;
}

export interface MoodEntry {
  id: string;
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Anxious' | 'Excited';
  note?: string;
  date: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

export interface Affirmation {
  id: string;
  content: string;
  author?: string;
  isAnonymous: boolean;
  likes: number;
  date: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
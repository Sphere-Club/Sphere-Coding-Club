
export enum Category {
  Tech = 'Technology',
  Arts = 'Arts & Design',
  Fitness = 'Fitness & Health',
  Academics = 'Academics',
  Languages = 'Languages',
  Business = 'Business & Marketing',
  Lifestyle = 'Lifestyle & Hobby'
}

export interface Skill {
  id: string;
  name: string;
  category: Category;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Testimonial {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  bio: string;
  skillsOffered: Skill[];
  skillsNeeded: Skill[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  location: string;
  testimonials?: Testimonial[];
}

export interface MatchScore {
  userId: string;
  score: number;
  reasoning: string;
  complementarySkills: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  type?: 'text' | 'proposal';
  proposalData?: {
    date: string;
    time: string;
    skill: string;
  };
}

export interface ChatSession {
  id: string;
  participants: [string, string];
  messages: Message[];
}

export interface Notification {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  type: 'match' | 'message' | 'proposal' | 'system';
  text: string;
  timestamp: Date;
  isRead: boolean;
}

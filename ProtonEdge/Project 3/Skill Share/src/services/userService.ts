
import { User, Category } from '../types';

const USERS_KEY = 'skillswap_users';

export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
}

export const userService = {
    getUsers: (): User[] => {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    register: (name: string, email: string, password?: string): AuthResponse => {
        const users = userService.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'User already exists with this email.' };
        }

        const newUser: User & { email: string } = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            avatar: `https://picsum.photos/seed/${name.split(' ')[0]}/200`,
            bio: 'New community member!',
            skillsOffered: [],
            skillsNeeded: [],
            rating: 5.0,
            reviewCount: 0,
            isVerified: false,
            location: 'Remote',
            password: password
        } as any;

        localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
        return { success: true, user: newUser };
    },

    login: (email: string, password?: string): AuthResponse => {
        const users = userService.getUsers();
        const user = users.find(u => u.email === email);

        // For demo purposes, we also allow "admin@admin.com" or fixed demo accounts
        if (email === 'demo@demo.com' || email === 'vivaan@example.com') {
            return {
                success: true,
                user: {
                    id: 'me',
                    name: 'Vivaan Kapoor',
                    avatar: 'https://picsum.photos/seed/vivaan/200',
                    bio: 'Product Designer looking to learn some basic JavaScript to prototype better.',
                    skillsOffered: [
                        { id: 's11', name: 'UI/UX Design', category: Category.Arts, level: 'Expert' },
                        { id: 's12', name: 'Figma', category: Category.Arts, level: 'Expert' }
                    ],
                    skillsNeeded: [
                        { id: 's13', name: 'JavaScript', category: Category.Tech, level: 'Beginner' },
                        { id: 's1', name: 'React Development', category: Category.Tech, level: 'Beginner' }
                    ],
                    rating: 4.9,
                    reviewCount: 5,
                    isVerified: true,
                    location: 'Bangalore, KA'
                }
            };
        }

        if (user) {
            // @ts-ignore - password is saved in local storage object but not in User type
            if (user.password && user.password !== password) {
                return { success: false, error: 'Incorrect password.' };
            }
            return { success: true, user };
        }

        return { success: false, error: 'Invalid email or password. Please sign up if you don\'t have an account.' };
    }
};

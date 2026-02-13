
import { User, Category } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Ananya Sharma',
    avatar: 'https://picsum.photos/seed/ananya/200',
    bio: 'Senior Software Engineer with 8 years of experience in React and Node.js. Looking to pick up some oil painting skills!',
    skillsOffered: [
      { id: 's1', name: 'React Development', category: Category.Tech, level: 'Expert' },
      { id: 's2', name: 'Node.js', category: Category.Tech, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's3', name: 'Oil Painting', category: Category.Arts, level: 'Beginner' },
      { id: 's4', name: 'Color Theory', category: Category.Arts, level: 'Beginner' }
    ],
    rating: 4.9,
    reviewCount: 24,
    isVerified: true,
    location: 'Mumbai, MH',
    testimonials: [
      { id: 't1', authorName: 'Rohan Das', text: 'Ananya is an incredible teacher. She explained complex React hooks in a way that just clicked.', rating: 5, date: '2 days ago' }
    ]
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    avatar: 'https://picsum.photos/seed/arjun/200',
    bio: 'Professional artist and art teacher. I want to learn how to build my own portfolio website.',
    skillsOffered: [
      { id: 's3', name: 'Oil Painting', category: Category.Arts, level: 'Expert' },
      { id: 's5', name: 'Sketching', category: Category.Arts, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's1', name: 'Web Development', category: Category.Tech, level: 'Beginner' }
    ],
    rating: 4.8,
    reviewCount: 15,
    isVerified: true,
    location: 'Ahmedabad, GJ'
  },
  {
    id: 'u3',
    name: 'Ishaan Iyer',
    avatar: 'https://picsum.photos/seed/ishaan/200',
    bio: 'Digital Marketer and Yoga instructor. Passionate about languages.',
    skillsOffered: [
      { id: 's6', name: 'Yoga', category: Category.Fitness, level: 'Expert' },
      { id: 's7', name: 'Tamil', category: Category.Languages, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's8', name: 'Python', category: Category.Tech, level: 'Beginner' },
      { id: 's9', name: 'Public Speaking', category: Category.Business, level: 'Intermediate' }
    ],
    rating: 5.0,
    reviewCount: 12,
    isVerified: false,
    location: 'Chennai, TN'
  },
  {
    id: 'u4',
    name: 'Rohan Das',
    avatar: 'https://picsum.photos/seed/rohan/200',
    bio: 'Python Developer & Data Scientist. I love staying fit and want to learn Yoga.',
    skillsOffered: [
      { id: 's8', name: 'Python', category: Category.Tech, level: 'Expert' },
      { id: 's10', name: 'Data Science', category: Category.Tech, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's6', name: 'Yoga', category: Category.Fitness, level: 'Beginner' }
    ],
    rating: 4.7,
    reviewCount: 8,
    isVerified: true,
    location: 'Kolkata, WB'
  },
  {
    id: 'u5',
    name: 'Priyanka Reddy',
    avatar: 'https://picsum.photos/seed/priyanka/200',
    bio: 'Photography enthusiast and professional baker. Looking to learn French for my next trip!',
    skillsOffered: [
      { id: 's14', name: 'Baking', category: Category.Lifestyle, level: 'Expert' },
      { id: 's15', name: 'Digital Photography', category: Category.Arts, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's16', name: 'French', category: Category.Languages, level: 'Beginner' }
    ],
    rating: 4.6,
    reviewCount: 21,
    isVerified: true,
    location: 'Hyderabad, TS'
  },
  {
    id: 'u6',
    name: 'Advait Kulkarni',
    avatar: 'https://picsum.photos/seed/advait/200',
    bio: 'Native Marathi speaker and calligrapher. I want to improve my Business English.',
    skillsOffered: [
      { id: 's17', name: 'Marathi', category: Category.Languages, level: 'Expert' },
      { id: 's18', name: 'Calligraphy', category: Category.Arts, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's19', name: 'Business English', category: Category.Languages, level: 'Intermediate' }
    ],
    rating: 4.9,
    reviewCount: 33,
    isVerified: true,
    location: 'Pune, MH'
  },
  {
    id: 'u7',
    name: 'Kavya Nair',
    avatar: 'https://picsum.photos/seed/kavya/200',
    bio: 'Financial analyst by day, salsa dancer by night. Seeking a Spanish tutor.',
    skillsOffered: [
      { id: 's20', name: 'Financial Modeling', category: Category.Business, level: 'Expert' },
      { id: 's21', name: 'Salsa Dancing', category: Category.Fitness, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's22', name: 'Spanish', category: Category.Languages, level: 'Intermediate' }
    ],
    rating: 4.7,
    reviewCount: 9,
    isVerified: false,
    location: 'Kochi, KL'
  },
  {
    id: 'u8',
    name: 'Sameer Khan',
    avatar: 'https://picsum.photos/seed/sameer/200',
    bio: 'App Developer focused on Android. I need help with video editing for my YouTube channel.',
    skillsOffered: [
      { id: 's23', name: 'Kotlin/Android Development', category: Category.Tech, level: 'Expert' },
      { id: 's24', name: 'App Design', category: Category.Arts, level: 'Intermediate' }
    ],
    skillsNeeded: [
      { id: 's25', name: 'Video Editing', category: Category.Arts, level: 'Beginner' }
    ],
    rating: 4.5,
    reviewCount: 14,
    isVerified: true,
    location: 'Lucknow, UP'
  },
  {
    id: 'u9',
    name: 'Meera Joshi',
    avatar: 'https://picsum.photos/seed/meera/200',
    bio: 'Public speaking coach and entrepreneur. Wanting to learn basic accounting.',
    skillsOffered: [
      { id: 's26', name: 'Public Speaking', category: Category.Business, level: 'Expert' },
      { id: 's27', name: 'Pitching', category: Category.Business, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's28', name: 'Accounting', category: Category.Business, level: 'Beginner' }
    ],
    rating: 5.0,
    reviewCount: 42,
    isVerified: true,
    location: 'Jaipur, RJ'
  },
  {
    id: 'u10',
    name: 'Kabir Singh',
    avatar: 'https://picsum.photos/seed/kabir/200',
    bio: 'Carpenter and woodworker. Looking to learn SEO for my online shop.',
    skillsOffered: [
      { id: 's29', name: 'Woodworking', category: Category.Lifestyle, level: 'Expert' },
      { id: 's30', name: 'Furniture Design', category: Category.Arts, level: 'Expert' }
    ],
    skillsNeeded: [
      { id: 's31', name: 'SEO', category: Category.Business, level: 'Beginner' }
    ],
    rating: 4.8,
    reviewCount: 11,
    isVerified: false,
    location: 'Chandigarh, CH'
  }
];

export const currentUser: User = {
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
  isVerified: false,
  location: 'Bangalore, KA'
};

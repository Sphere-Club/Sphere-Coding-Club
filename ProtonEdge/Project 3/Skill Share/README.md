# SkillSwap 🚀

A peer-to-peer skill exchange platform powered by AI, where users can teach what they know and learn what they need.

## 🌟 Features

- **AI-Powered Matching**: Intelligent matchmaking based on skills offered and needed
- **Smart Insights**: AI-generated session plans for skill swaps
- **Real-time Chat**: AI-assisted conversations with potential swap partners
- **Live Sessions**: Video-based skill exchange sessions (optional feature)
- **Secure Architecture**: Backend proxy to protect API credentials

## 🏗️ Architecture

```
SkillSwap/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API service layer
│   ├── pages/             # Page components
│   └── types/             # TypeScript definitions
├── server/                # Backend Express server
│   ├── server.js          # API proxy endpoints
│   └── package.json       # Backend dependencies
└── public/                # Static assets
```

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend (Node.js + Express)
- **Framework**: Express.js
- **AI Integration**: Google Gemini API
- **Security**: CORS, environment variables

## 🔐 Security

> [!IMPORTANT]
> This project uses a **backend proxy architecture** to keep the Gemini API key secure and prevent client-side exposure.

**What's Protected:**
- ✅ Match scoring API calls
- ✅ AI insight generation
- ✅ Chat response generation

**Security Limitation:**
- ⚠️ LiveSession component requires client-side API key (disabled by default)
- See [`server/LIVESESSION_SECURITY.md`](server/LIVESESSION_SECURITY.md) for details

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-3-skill-share
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create `.env.local` in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_BACKEND_URL=http://localhost:3001
   ```

   Create `server/.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

### Running the Application

You need to run **both** the frontend and backend servers:

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```
Backend will start on `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```
Frontend will start on `http://localhost:3000`

### 🌐 Access the Application

Once both servers are running, access the application at:

- **Frontend (Main App)**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── MatchCard.tsx          # User match display with AI insights
│   ├── LiveSession.tsx        # Video session component (⚠️ see security docs)
│   └── ...
├── services/
│   └── geminiService.ts       # Backend API client
├── pages/
│   ├── Home.tsx
│   ├── Matches.tsx
│   └── Chat.tsx
└── types/
    └── index.ts               # TypeScript type definitions

server/
├── server.js                  # Express API server
├── package.json
├── README.md                  # Backend setup instructions
└── LIVESESSION_SECURITY.md    # Security documentation
```

## 🔌 API Endpoints

The backend server exposes the following endpoints:

### `POST /api/match-scores`
Calculate compatibility scores between users
```json
{
  "currentUser": { ... },
  "availableUsers": [ ... ]
}
```

### `POST /api/swap-insight`
Generate AI-powered session plan
```json
{
  "userA": { ... },
  "userB": { ... }
}
```

### `POST /api/chat-response`
Generate AI chat responses
```json
{
  "history": [ ... ],
  "currentUser": { ... },
  "otherUser": { ... },
  "incomingMessage": "..."
}
```

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm start` - Start backend server
- `npm run dev` - Start with auto-reload (if configured)

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Functional React components with hooks
- Async/await for asynchronous operations

## 📚 Documentation

- [Backend Setup Guide](server/README.md)
- [LiveSession Security Documentation](server/LIVESESSION_SECURITY.md)
- [Implementation Walkthrough](docs/walkthrough.md) *(if available)*

## ⚠️ Known Issues & Limitations

1. **LiveSession Component**: Requires client-side API key access for real-time streaming. Disabled by default for security.
2. **API Rate Limits**: Gemini API has rate limits. Consider implementing caching for production.
3. **Mock Data**: Currently uses mock user data. Integrate with a real database for production.

## 🔮 Future Enhancements

- [ ] WebSocket proxy for LiveSession security
- [ ] User authentication and profiles
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Session scheduling and calendar integration
- [ ] Rating and review system
- [ ] Payment integration for premium features
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Vite](https://vitejs.dev/) for blazing fast development
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**

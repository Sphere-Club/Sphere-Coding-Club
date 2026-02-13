import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI client
const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in server environment');
    }
    return new GoogleGenAI({ apiKey });
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'SkillSwap backend is running' });
});

// Match scores endpoint
app.post('/api/match-scores', async (req, res) => {
    try {
        const { currentUser, availableUsers } = req.body;

        const prompt = `
      You are an AI matchmaking engine for "SkillSwap", a peer-to-peer skill exchange platform.
      Your goal is to calculate a compatibility score (0-100) between the current user and other community members.
      
      A high score is awarded when User A's "skillsNeeded" overlap with User B's "skillsOffered" AND vice-versa.
      
      Current User:
      Name: ${currentUser.name}
      Offered: ${currentUser.skillsOffered.map(s => s.name).join(', ')}
      Needed: ${currentUser.skillsNeeded.map(s => s.name).join(', ')}
      
      Candidates:
      ${availableUsers.map(u => `
        - ID: ${u.id}
          Name: ${u.name}
          Offered: ${u.skillsOffered.map(s => s.name).join(', ')}
          Needed: ${u.skillsNeeded.map(s => s.name).join(', ')}
      `).join('\n')}
    `;

        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            userId: { type: Type.STRING },
                            score: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                            complementarySkills: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['userId', 'score', 'reasoning', 'complementarySkills']
                    }
                }
            }
        });

        const results = JSON.parse(response.text || '[]');
        res.json(results);
    } catch (error) {
        console.error('Match scores error:', error);
        res.status(500).json({
            error: 'Failed to calculate match scores',
            message: error.message
        });
    }
});

// Swap insight endpoint
app.post('/api/swap-insight', async (req, res) => {
    try {
        const { userA, userB } = req.body;

        const prompt = `
      Create a 3-step action plan for a 1-hour skill swap between ${userA.name} and ${userB.name}.
      ${userA.name} offers: ${userA.skillsOffered.map(s => s.name).join(', ')}
      ${userB.name} offers: ${userB.skillsOffered.map(s => s.name).join(', ')}
      Keep it concise and practical. Format it as a simple list.
    `;

        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });

        res.json({ insight: response.text || 'No insights available at this time.' });
    } catch (error) {
        console.error('Swap insight error:', error);
        res.status(500).json({
            error: 'Failed to generate insight',
            message: error.message
        });
    }
});

// Chat response endpoint
app.post('/api/chat-response', async (req, res) => {
    try {
        const { history, currentUser, otherUser, incomingMessage } = req.body;

        const conversationHistory = history.map(msg =>
            `${msg.senderId === 'me' ? currentUser.name : otherUser.name}: ${msg.text}`
        ).join('\n');

        const prompt = `
      You are roleplaying as ${otherUser.name} on a skill-sharing platform called SkillSwap.
      
      Your Profile:
      - Name: ${otherUser.name}
      - Skills You Offer: ${otherUser.skillsOffered.map(s => s.name).join(', ')}
      - Skills You Need: ${otherUser.skillsNeeded.map(s => s.name).join(', ')}
      - Bio: ${otherUser.bio || "Enthusiastic about sharing knowledge."}

      The User you are talking to:
      - Name: ${currentUser.name || "Use Partner"}
      
      Conversation Context:
      ${conversationHistory}
      ${currentUser.name}: ${incomingMessage}

      Rules:
      - Respond naturally as ${otherUser.name}.
      - Keep responses concise (under 3 sentences usually).
      - Be friendly and encouraging.
      - If the user proposes a swap, be enthusiastic (unless the skills don't match at all, then be polite but open).
      - Do not include timestamps or "System:" prefixes.
      
      Respond to: "${incomingMessage}"
    `;

        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });

        res.json({ response: response.text || 'That sounds great!' });
    } catch (error) {
        console.error('Chat response error:', error);
        res.status(500).json({
            error: 'Failed to generate chat response',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SkillSwap backend running on http://localhost:${PORT}`);
    console.log(`✅ API Key loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});

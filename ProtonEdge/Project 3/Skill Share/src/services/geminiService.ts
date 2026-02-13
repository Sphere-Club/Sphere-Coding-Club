
import { User, MatchScore } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function calculateMatchScores(currentUser: User, availableUsers: User[]): Promise<MatchScore[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/match-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentUser, availableUsers })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error("Matchmaking failed:", error);
    return availableUsers.map(u => ({
      userId: u.id,
      score: Math.floor(Math.random() * 40) + 50,
      reasoning: "A potential match based on shared interests.",
      complementarySkills: [u.skillsOffered[0]?.name]
    }));
  }
}

// ... existing code ...

export async function generateSwapInsight(userA: User, userB: User): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/swap-insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userA, userB })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.insight || "No insights available at this time.";
  } catch (err) {
    console.error("Swap insight error:", err);
    return "Let's connect and figure out a plan together!";
  }
}

export async function generateChatResponse(
  history: any[], // using any to avoid type circular dependency issues if Message isn't exported safely, but ideally import Message
  currentUser: User,
  otherUser: User,
  incomingMessage: string
): Promise<string> {
  console.log("Generating chat with backend API");
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, currentUser, otherUser, incomingMessage })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "That sounds great!";
  } catch (error: any) {
    console.error("Chat generation failed DETAILED:", error);
    if (error.message) console.error("Error Message:", error.message);
    return `(Error: ${error?.message || "Unknown API Error"}. Please check console for details.)`;
  }
}

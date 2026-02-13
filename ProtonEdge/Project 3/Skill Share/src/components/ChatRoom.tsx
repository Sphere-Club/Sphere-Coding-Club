
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { Icons } from '../constants';
import LiveSession from './LiveSession';
import { generateChatResponse } from '../services/geminiService';

interface ChatRoomProps {
  otherUser: User;
  onBack: () => void;
  isDesktop?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ otherUser, onBack, isDesktop }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: otherUser.id,
      text: `Hi Vivaan! I saw that you're looking for help with JavaScript. I'd love to help you out if you can show me some UI/UX tips in Figma!`,
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);
  const [input, setInput] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleSend = async (text?: string, type: 'text' | 'proposal' = 'text', proposalData?: any) => {
    const finalMsg = text || input;
    if (!finalMsg.trim() && type === 'text') return;

    // Create new user message
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: finalMsg,
      timestamp: new Date(),
      type,
      proposalData
    };

    // Optimistically update UI
    setMessages(prev => [...prev, newMessage]);
    if (type === 'text') setInput('');
    setIsScheduling(false);

    if (type === 'text') {
      // Create a mock current user context (assuming Vivaan based on initial message)
      const currentUser: User = {
        id: 'me',
        name: 'Vivaan',
        avatar: '',
        bio: 'Product Designer',
        skillsOffered: [{ id: 's1', name: 'UI/UX Design', category: 'Arts' as any, level: 'Expert' }],
        skillsNeeded: [{ id: 's2', name: 'JavaScript', category: 'Tech' as any, level: 'Beginner' }],
        rating: 5,
        reviewCount: 0,
        isVerified: true,
        location: 'Remote'
      };

      try {
        // Generate AI response
        const newHistory = [...messages, newMessage];
        const responseText = await generateChatResponse(newHistory, currentUser, otherUser, finalMsg);

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          senderId: otherUser.id,
          text: responseText,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error("AI response failed", error);
        setErrorMessage("Thinking failed. Please check console for API key or network errors.");
        // Fallback or ignore
      }
    }
  };

  const proposeSession = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const skill = formData.get('skill') as string;
    handleSend(`Swap Session Proposal: ${skill}`, 'proposal', { date, time, skill });
  };

  const handleAcceptProposal = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: '✓ Session Accepted!' } : m));
    setTimeout(() => {
      handleSend(`Awesome! I've added it to our schedule.`);
    }, 500);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 ${isDesktop ? '' : 'absolute inset-0 z-50'}`}>
      {activeLiveSession && (
        <LiveSession
          otherUser={otherUser}
          skill={activeLiveSession}
          onClose={() => setActiveLiveSession(null)}
        />
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-4" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
          </span>
        </div>
      )}

      {/* Chat Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img src={otherUser.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
          <div>
            <h2 className="font-black text-slate-900 leading-none text-lg">{otherUser.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">Active Now</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveLiveSession(otherUser.skillsOffered[0]?.name || 'Skill Exchange')}
            title="Start Live Lesson"
            className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
          >
            <Icons.Video />
          </button>
          <button
            onClick={() => setIsScheduling(!isScheduling)}
            title="Schedule Session"
            className={`p-3 rounded-xl transition-all shadow-sm ${isScheduling ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <Icons.Calendar />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'proposal' ? (
              <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xl max-w-sm w-full animate-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Icons.Calendar />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Session Proposed</p>
                    <h4 className="font-bold text-slate-900">{msg.proposalData?.skill}</h4>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Date</p>
                    <p className="text-xs font-bold text-slate-700">{msg.proposalData?.date}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Time</p>
                    <p className="text-xs font-bold text-slate-700">{msg.proposalData?.time}</p>
                  </div>
                </div>
                {msg.senderId === 'me' ? (
                  <p className="text-[10px] text-center text-slate-400 italic">Waiting for response...</p>
                ) : (
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Decline</button>
                    <button
                      onClick={() => handleAcceptProposal(msg.id)}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`max-w-[70%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.senderId === 'me'
                ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100'
                : 'bg-white text-slate-700 rounded-bl-none shadow-md border border-slate-100'
                }`}>
                {msg.text}
                <div className={`text-[10px] mt-2 opacity-70 font-bold uppercase tracking-widest ${msg.senderId === 'me' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={scrollRef} />

        {/* Scheduling Overlay */}
        {isScheduling && (
          <div className="absolute inset-x-8 bottom-8 z-20 animate-in slide-in-from-bottom-4 duration-300">
            <form onSubmit={proposeSession} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Propose Swap Session</h3>
                <button type="button" onClick={() => setIsScheduling(false)} className="text-slate-400 hover:text-slate-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date</label>
                  <input required name="date" type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Time</label>
                  <input required name="time" type="time" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Skill to Learn</label>
                <select name="skill" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {otherUser.skillsOffered.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                Send Proposal
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 p-6">
        <div className="flex gap-4 items-center">
          <button className="text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Start typing your message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none pr-12"
            />
            <button
              onClick={() => handleSend()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
            >
              <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

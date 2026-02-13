
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import MatchCard from './components/MatchCard';
import ChatRoom from './components/ChatRoom';
import LoginPage from './components/LoginPage';
import { User, MatchScore, Skill, Category, Notification } from './types';
import { mockUsers, currentUser as initialUser } from './data/mockUsers';
import { calculateMatchScores } from './services/geminiService';
import { Icons } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Local User State
  const [user, setUser] = useState<User>(initialUser);

  // Search and Display State
  const [searchQuery, setSearchQuery] = useState('');
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      userId: 'u1',
      userName: 'Ananya Sharma',
      userAvatar: 'https://picsum.photos/seed/ananya/200',
      type: 'message',
      text: 'sent you a message about React development.',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: 'n2',
      userId: 'u2',
      userName: 'Arjun Mehta',
      userAvatar: 'https://picsum.photos/seed/arjun/200',
      type: 'match',
      text: 'You have a new 92% match score!',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false
    },
    {
      id: 'n3',
      type: 'system',
      text: 'Welcome to SkillSwap! Start by exploring skills.',
      timestamp: new Date(Date.now() - 86400000),
      isRead: true
    }
  ]);

  // Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<User>({ ...user });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillNeeded, setNewSkillNeeded] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  // Initialization: Randomize users for the feed whenever logged in
  useEffect(() => {
    if (isLoggedIn) {
      const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
      setDisplayUsers(shuffled);
    }
  }, [isLoggedIn]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return displayUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.skillsOffered.some(s => s.name.toLowerCase().includes(q)) ||
      u.skillsNeeded.some(s => s.name.toLowerCase().includes(q))
    );
  }, [searchQuery, displayUsers]);

  const handleMatchmaking = async () => {
    setLoadingMatches(true);
    try {
      const candidates = [...mockUsers].sort(() => 0.5 - Math.random()).slice(0, 6);
      const scores = await calculateMatchScores(user, candidates);
      setMatchScores(scores.sort((a, b) => b.score - a.score));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setMatchScores([]);
    setActiveChat(null);
    setViewingUser(null);
    setSearchQuery('');
  };

  const handleStartChat = (targetUser: User) => {
    setActiveChat(targetUser);
    setViewingUser(null);
  };

  const handleRequestVerification = () => {
    setVerifyStatus('submitting');
    setTimeout(() => {
      setVerifyStatus('success');
      setUser(prev => ({ ...prev, isVerified: true }));
    }, 1500);
  };

  const closeVerifyModal = () => {
    setIsVerifyModalOpen(false);
    setTimeout(() => setVerifyStatus('idle'), 300);
  };

  const handleSaveProfile = () => {
    setUser(editForm);
    setIsEditModalOpen(false);
  };

  const addSkill = (type: 'offered' | 'needed') => {
    const name = type === 'offered' ? newSkillOffered : newSkillNeeded;
    if (!name.trim()) return;

    const newSkill: Skill = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category: Category.Tech,
      level: newSkillLevel
    };

    setEditForm(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsNeeded']: [
        ...prev[type === 'offered' ? 'skillsOffered' : 'skillsNeeded'],
        newSkill
      ]
    }));

    if (type === 'offered') setNewSkillOffered('');
    else setNewSkillNeeded('');
    setNewSkillLevel('Intermediate');
  };

  const removeSkill = (id: string, type: 'offered' | 'needed') => {
    setEditForm(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsNeeded']: prev[type === 'offered' ? 'skillsOffered' : 'skillsNeeded'].filter(s => s.id !== id)
    }));
  };

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };


  // Notification Actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: Notification) => {
    handleMarkAsRead(notif.id);
    if (notif.userId) {
      const target = mockUsers.find(u => u.id === notif.userId);
      if (target) {
        if (notif.type === 'message' || notif.type === 'proposal') {
          handleStartChat(target);
          // In Routing mode, we'd navigate to messages
        } else if (notif.type === 'match') {
          setViewingUser(target);
          // In Routing mode, we'd navigate to home
        }
      }
    }
  };

  const handleRequestSwap = (userId: string) => {
    const target = mockUsers.find(u => u.id === userId);
    if (target) {
      handleStartChat(target);
      const newNotif: Notification = {
        id: Math.random().toString(),
        userId: target.id,
        userName: target.name,
        userAvatar: target.avatar,
        type: 'message',
        text: `replied to your swap request: "Hey ${user.name.split(' ')[0]}, I'm interested!"`,
        timestamp: new Date(),
        isRead: false
      };
      setTimeout(() => setNotifications(prev => [newNotif, ...prev]), 2000);
    }
  };

  const renderProfileDetails = (u: User, isOwn: boolean = false) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        {!isOwn && (
          <button
            onClick={() => setViewingUser(null)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 shadow-sm transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
          {isOwn ? 'My Account' : `${u.name}'s Profile`}
        </h2>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col md:flex-row items-center md:items-start gap-10 mb-10 shadow-sm relative overflow-hidden">
        <div className="relative">
          <img src={u.avatar} className="w-40 h-40 rounded-[2.5rem] object-cover ring-8 ring-slate-50 shadow-2xl shadow-indigo-100" alt="" />
          {isOwn && (
            <button
              onClick={() => {
                setEditForm({ ...user });
                setIsEditModalOpen(true);
              }}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
            >
              <Icons.Sparkles />
            </button>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              {u.name}
              {u.isVerified && <Icons.Verified className="w-8 h-8" />}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {u.isVerified && (
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-1 border border-indigo-100">
                  <Icons.Verified /> Verified Member
                </span>
              )}
              {isOwn ? (
                <>
                  {!u.isVerified && (
                    <button onClick={() => setIsVerifyModalOpen(true)} className="px-4 py-1.5 bg-white text-slate-600 hover:text-indigo-600 rounded-full text-xs font-bold border border-slate-200 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Verify Skills
                    </button>
                  )}
                  <button onClick={() => { setEditForm({ ...user }); setIsEditModalOpen(true); }} className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all shadow-sm">
                    Edit Profile
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStartChat(u)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Send Message
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-600 text-lg max-w-xl leading-relaxed mb-6">{u.bio}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Icons.Star />
              <span>{u.rating}</span>
              <span className="text-slate-400 font-medium">({u.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {u.location}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              Expertise Offered
            </h3>
          </div>
          {u.skillsOffered.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {u.skillsOffered.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-5 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl">
                  <span className="font-bold text-indigo-900">{skill.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white text-indigo-600 shadow-sm">{skill.level}</span>
                </div>
              ))}
            </div>
          ) : <div className="py-10 text-center text-slate-400 italic">No expertise listed.</div>}
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
              Learning Goals
            </h3>
          </div>
          {u.skillsNeeded.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {u.skillsNeeded.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-5 bg-rose-50/30 border border-rose-100/50 rounded-2xl">
                  <span className="font-bold text-rose-900">{skill.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white text-rose-600 shadow-sm">{skill.level}</span>
                </div>
              ))}
            </div>
          ) : <div className="py-10 text-center text-slate-400 italic">No goals listed.</div>}
        </div>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="">
      {viewingUser ? renderProfileDetails(viewingUser) : (
        <>
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Discover Communities</h2>
              <p className="text-slate-500 mt-1">Explore skilled members ready to share knowledge.</p>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex gap-4 items-start mb-6">
                    <button
                      onClick={() => setViewingUser(u)}
                      className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <img src={u.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-slate-50" alt="" />
                      {u.isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                          <Icons.Verified className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h3
                          onClick={() => setViewingUser(u)}
                          className="font-bold text-slate-900 text-lg leading-tight truncate cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          {u.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-50 px-2 py-1 rounded-md font-black shrink-0">
                          <Icons.Star />
                          <span>{u.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{u.location}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-6 min-h-[40px] leading-relaxed">{u.bio}</p>

                  <div className="space-y-3 mb-6">
                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <span className="text-[10px] font-black text-indigo-400 block uppercase tracking-wider mb-1">Teaching</span>
                      <div className="flex flex-wrap gap-1">
                        {u.skillsOffered.slice(0, 2).map(s => (
                          <span key={s.id} className="text-xs font-bold text-slate-700 bg-white/60 px-2 py-0.5 rounded shadow-sm">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingUser(u)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <Icons.Search />
              <p className="mt-4 font-bold">No results found for "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const LandingView = () => (
    <div className="">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-3xl -z-10"></div>

        <div className="text-center max-w-4xl mx-auto mb-20 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 animate-bounce">
            <Icons.Sparkles className="w-4 h-4" />
            The Future of Collaborative Learning
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Master New Skills Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pure Exchange.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            SkillSwap is a premium community where expertise is the only currency. Teach what you love, learn what you need, and grow together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95 w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto text-center"
            >
              Login
            </Link>
          </div>
        </div>



        {/* HomeView Preview */}
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
          <div className="opacity-40 scale-[0.98] pointer-events-none">
            <HomeView />
          </div>
          <div className="absolute inset-x-0 bottom-20 z-20 flex justify-center">
            <Link to="/signup" className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm hover:bg-indigo-600 transition-all shadow-2xl">
              Sign In to Explore
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Why SkillSwap?</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">We've built the most intelligent platform for peer-to-peer knowledge transfer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'AI Matching', desc: 'Our Gemini-powered engine finds the perfect mentors based on your goals.', icon: <Icons.Search /> },
              { title: 'Verified Skills', desc: 'Trust is our foundation. Every expert is verified by the community.', icon: <Icons.Verified /> },
              { title: 'Safe Exchange', desc: 'Our points system ensures every swap is fair and rewarding.', icon: <Icons.Sparkles /> }
            ].map((f, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-200/50 mb-8 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const MatchesView = () => (
    <div className="">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Matchmaker</h2>
          <p className="text-slate-500 mt-1">Smart, algorithmic compatibility suggestions.</p>
        </div>
        <button
          onClick={handleMatchmaking}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <svg className={`w-5 h-5 ${loadingMatches ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate Matches
        </button>
      </div>

      {loadingMatches ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800">Processing Skills Matrix...</h3>
          <p className="text-slate-400 mt-1">Calculating compatibility across the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matchScores.map(match => {
            const targetUser = mockUsers.find(u => u.id === match.userId);
            if (!targetUser) return null;
            return (
              <MatchCard
                key={targetUser.id}
                user={targetUser}
                match={match}
                onChat={handleRequestSwap}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  const MessagesView = () => (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex h-[700px] shadow-sm">
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-xl text-slate-900">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mockUsers.slice(0, 5).map(u => (
            <button
              key={u.id}
              onClick={() => setActiveChat(u)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${activeChat?.id === u.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={u.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-slate-900 truncate text-sm flex items-center gap-1">
                    {u.name}
                    {u.isVerified && <Icons.Verified className="w-3 h-3" />}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">Let's trade skills!</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative bg-slate-50/30">
        {activeChat ? (
          <ChatRoom
            otherUser={activeChat}
            onBack={() => setActiveChat(null)}
            isDesktop={true}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 px-10 text-center">
            <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center">
              <Icons.Chat />
            </div>
            <div>
              <h3 className="text-slate-800 font-black">Your Communication Hub</h3>
              <p className="text-sm font-medium mt-1">Select a conversation or a match to start a skill swap session.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLayout = (children: React.ReactNode) => (
    <Layout
      user={isLoggedIn ? user : null}
      notifications={isLoggedIn ? notifications : []}
      onMarkAsRead={handleMarkAsRead}
      onClearAll={handleClearAll}
      onNotificationClick={handleNotificationClick}
      onLogout={handleLogout}
      isLoggedIn={isLoggedIn}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {children}
    </Layout>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? renderLayout(<HomeView />) : <LandingView />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLoginSuccess} initialMode="login" />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLoginSuccess} initialMode="signup" />} />

        {/* Protected Routes */}
        <Route path="/matches" element={isLoggedIn ? renderLayout(<MatchesView />) : <Navigate to="/login" replace />} />
        <Route path="/messages" element={isLoggedIn ? renderLayout(<MessagesView />) : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isLoggedIn ? renderLayout(renderProfileDetails(user, true)) : <Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Verification Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={closeVerifyModal} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {verifyStatus === 'idle' && (
              <>
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Icons.Verified className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Skill Verification</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Get the "Verified" badge by providing proof of your expertise. This increases your match score and trustworthiness.</p>
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Portfolio Link</label>
                    <input type="text" placeholder="https://yourportfolio.com" className="w-full bg-transparent border-none p-0 text-sm font-semibold text-slate-900 focus:ring-0 placeholder:text-slate-300" />
                  </div>
                </div>
                <button onClick={handleRequestVerification} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Submit Request</button>
              </>
            )}
            {verifyStatus === 'submitting' && (
              <div className="py-12 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-900">Uploading Evidence...</h3>
              </div>
            )}
            {verifyStatus === 'success' && (
              <div className="py-8 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h3>
                <button onClick={closeVerifyModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl">Got it, thanks!</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-6">Edit Professional Profile</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio</label>
                <textarea rows={3} value={editForm.bio} onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Expertise Offered</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add a skill..." value={newSkillOffered} onChange={e => setNewSkillOffered(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 outline-none" />
                    <button onClick={() => addSkill('offered')} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"><Icons.Sparkles /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.skillsOffered.map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {s.name} ({s.level[0]})
                        <button onClick={() => removeSkill(s.id, 'offered')} className="ml-1 text-indigo-300 hover:text-indigo-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-rose-400 ml-1">Learning Goals</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add a goal..." value={newSkillNeeded} onChange={e => setNewSkillNeeded(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 outline-none" />
                    <button onClick={() => addSkill('needed')} className="bg-rose-600 text-white p-2 rounded-xl hover:bg-rose-700 transition-colors"><Icons.Search /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.skillsNeeded.map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {s.name}
                        <button onClick={() => removeSkill(s.id, 'needed')} className="ml-1 text-rose-300 hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleSaveProfile} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;

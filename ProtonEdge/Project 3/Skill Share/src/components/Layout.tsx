
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { User, Notification } from '../types';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  notifications,
  onMarkAsRead,
  onClearAll,
  onNotificationClick,
  onLogout,
  isLoggedIn,
  searchQuery,
  onSearchChange
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[1] || 'home';
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-100">S</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">SkillSwap</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <SidebarLink
            active={activeTab === 'home' || activeTab === ''}
            onClick={() => navigate('/')}
            icon={<Icons.Home />}
            label="Discover"
          />
          {isLoggedIn && (
            <>
              <SidebarLink
                active={activeTab === 'matches'}
                onClick={() => navigate('/matches')}
                icon={<Icons.Search />}
                label="AI Matches"
              />
              <SidebarLink
                active={activeTab === 'messages'}
                onClick={() => navigate('/messages')}
                icon={<Icons.Chat />}
                label="Messages"
              />
              <SidebarLink
                active={activeTab === 'profile'}
                onClick={() => navigate('/profile')}
                icon={<Icons.Profile />}
                label="My Profile"
              />
            </>
          )}
        </nav>

        <div className="px-4 py-4 space-y-2 border-t border-slate-100">
          {isLoggedIn ? (
            <>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 group"
              >
                <div className="text-slate-400 group-hover:text-rose-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Sign Out</span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100 transition-all text-left group"
              >
                <img src={user?.avatar} className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-indigo-600 transition-colors">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">1,240 Points</p>
                </div>
              </button>
            </>
          ) : (
            <div className="p-2 space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Platform</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-slate-900 capitalize font-semibold">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="Search skills, people..."
                    className="w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all"
                  />
                </div>

                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <button
                          onClick={onClearAll}
                          className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                onNotificationClick(n);
                                setIsNotifOpen(false);
                              }}
                              className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                            >
                              {!n.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                              {n.userAvatar ? (
                                <img src={n.userAvatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                  <Icons.Sparkles />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-800 leading-snug">
                                  <span className="font-bold">{n.userName || 'System'}</span> {n.text}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center text-slate-400 text-sm">
                            No new notifications
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
                          View All History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition-all shadow-lg"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}
  >
    <div className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </div>
    <span className="text-sm font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
  </button>
);

export default Layout;

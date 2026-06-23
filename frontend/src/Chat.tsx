import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Bell, Menu, Phone, Video, Info, 
  MessageSquare, PlusCircle, Smile, Send, X, Edit3, Loader2,
  Users, UserPlus, Check
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Layout from './components/Layout';
import { useAuthStore } from './store/authStore';
import { useChat, useConversationMessages } from './hooks/useChat';
import { Conversation, ParticipantInfo } from './types/chat';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { UserSearchResponse } from './types/friend.types';

export default function Chat() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { conversations, loadingConversations, onlineUsers } = useChat(user?.id);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [errorDialog, setErrorDialog] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ''});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group Chat Creation state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState<UserSearchResponse[]>([]);
  const [isGroupSearching, setIsGroupSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<UserSearchResponse[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const selectedConversation = useMemo(() => 
    conversations?.find(c => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const { messages, loadingHistory, sendMessage, sendTyping, typingUsers } = 
    useConversationMessages(selectedConversationId, user?.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    sendMessage(messageText);
    setMessageText('');
  };

  const typingUserNames = useMemo(() => {
    if (!selectedConversation) return [];
    return Object.keys(typingUsers)
      .filter(id => typingUsers[id])
      .map(id => {
        const p = selectedConversation.participants.find(p => p.userId === id);
        return p?.displayName || p?.username || 'Someone';
      });
  }, [typingUsers, selectedConversation]);

  const isUserOnline = (userId: string) => !!onlineUsers[userId];

  const getConversationTitle = (conv: Conversation) => {
    if (conv.type === 'GROUP') return conv.name || 'Group Chat';
    const otherParticipant = conv.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.displayName || otherParticipant?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'GROUP') return 'https://ui-avatars.com/api/?name=Group';
    const otherParticipant = conv.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.username || '?'}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          // import { friendService } from './services/friend.service';
          const { friendService } = await import('./services/friend.service');
          const results = await friendService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error('Search error', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Group chat user search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (groupSearchQuery.trim().length >= 2) {
        setIsGroupSearching(true);
        try {
          const { friendService } = await import('./services/friend.service');
          const results = await friendService.searchUsers(groupSearchQuery);
          // Filter out already selected members and self
          const filtered = results.filter(
            r => r.id !== user?.id && !selectedMembers.some(m => m.id === r.id)
          );
          setGroupSearchResults(filtered);
        } catch (err) {
          console.error('Group search error', err);
        } finally {
          setIsGroupSearching(false);
        }
      } else {
        setGroupSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [groupSearchQuery, selectedMembers, user?.id]);

  const handleAddMember = (member: UserSearchResponse) => {
    setSelectedMembers(prev => [...prev, member]);
    setGroupSearchQuery('');
    setGroupSearchResults([]);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    setIsCreatingGroup(true);
    try {
      const { chatService } = await import('./services/chat.service');
      const participantIds = selectedMembers.map(m => m.id);
      const conv = await chatService.createGroupConversation(groupName, participantIds);
      
      queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
        if (!old) return [conv];
        return [conv, ...old];
      });

      setSelectedConversationId(conv.id);
      // Reset modal state
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      setGroupSearchQuery('');
    } catch (err: any) {
      setErrorDialog({
        isOpen: true,
        message: err.response?.data?.message || 'Could not create group chat'
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCloseCreateGroup = () => {
    setShowCreateGroup(false);
    setGroupName('');
    setSelectedMembers([]);
    setGroupSearchQuery('');
    setGroupSearchResults([]);
  };

  const handleStartConversation = async (otherUser: any) => {
    try {
      const { chatService } = await import('./services/chat.service');
      const conv = await chatService.getOrCreateDirectConversation(otherUser.userId || otherUser.id);
      
      // Manually update conversations cache with the new conversation
      queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => {
        if (!old) return [conv];
        // Check if conversation already exists
        const exists = old.some(c => c.id === conv.id);
        if (exists) return old;
        // Add new conversation at the beginning
        return [conv, ...old];
      });
      
      setSelectedConversationId(conv.id);
      setSearchQuery('');
    } catch (err: any) {
      setErrorDialog({
        isOpen: true,
        message: err.response?.data?.message || 'Could not start conversation'
      });
    }
  };

  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container pb-20 md:pb-0 h-screen flex flex-col">
        
        {/* Top App Bar (Mobile Content Header) */}
        <header className="md:hidden flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button className="p-2 flex-col items-center gap-1 text-primary-container">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary truncate">Moments</h2>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2 text-on-surface-variant hover:bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <Bell size={24} />
            </button>
            <button className="p-2 text-primary font-bold bg-primary-container/20 rounded-full transition-colors active:scale-95">
              <MessageSquare size={24} className="fill-current" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center px-8 py-4 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-bold text-primary tracking-tight">Moments</span>
            <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full gap-2 w-72 border border-outline-variant/20 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
              <Search size={20} className="text-outline shrink-0" />
              <input 
                type="text" 
                placeholder="Search memories..." 
                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-outline-variant outline-none text-on-surface"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 rounded-full active:scale-95">
              <Bell size={22} />
            </button>
            <button className="p-2.5 text-primary font-bold bg-primary-container/20 hover:bg-surface-container-high transition-colors duration-200 rounded-full active:scale-95 relative">
              <MessageSquare size={22} className="fill-current" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shrink-0 ml-2">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User'}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-4 flex flex-col md:flex-row gap-6 overflow-hidden md:h-[calc(100vh-80px)]">
          {/* Conversation List Sidebar */}
          <section className="flex flex-col w-full md:w-[320px] lg:w-[380px] bg-surface-container-low md:h-full rounded-[2rem] overflow-hidden border border-surface-container shrink-0 shadow-[0_4px_20px_rgba(28,28,24,0.03)] h-[400px] md:h-auto">
            <div className="p-6 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">Messages</h2>
                <button 
                  onClick={() => setShowCreateGroup(true)}
                  className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  title="Create Group Chat"
                >
                  <Users size={18} />
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people..." 
                  className="w-full bg-surface-container-lowest border-2 border-transparent focus:border-tertiary-container rounded-full px-4 py-2.5 pl-11 text-sm font-medium focus:ring-0 transition-all outline-none text-on-surface placeholder:text-on-surface-variant"
                />
                <Search size={18} className="absolute left-4 top-3 text-outline-variant" />
                
                {/* Search Results Overlay */}
                {searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest rounded-2xl shadow-xl z-50 overflow-hidden border border-outline-variant/20">
                    {isSearching ? (
                      <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" size={20} /></div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(res => (
                        <div 
                          key={res.id || res.userId}
                          onClick={() => handleStartConversation(res)}
                          className="flex items-center gap-3 p-3 hover:bg-primary-container/20 cursor-pointer transition-colors border-b border-outline-variant/10 last:border-0"
                        >
                          <img src={res.avatarUrl || `https://ui-avatars.com/api/?name=${res.username}`} className="w-10 h-10 rounded-full shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{res.displayName || res.username}</p>
                            <p className="text-xs text-on-surface-variant truncate">@{res.username}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-on-surface-variant">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent px-4 pb-4">
              
              {loadingConversations ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : conversations?.map(conv => (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`flex items-center gap-4 p-3 mb-2 rounded-2xl cursor-pointer transition-all hover:bg-surface-container-high group ${selectedConversationId === conv.id ? 'bg-surface-container-highest/60' : ''}`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={getConversationAvatar(conv)} 
                      alt={getConversationTitle(conv)} 
                      className="w-12 h-12 rounded-full object-cover border border-outline-variant/20"
                      referrerPolicy="no-referrer"
                    />
                    {conv.type === 'DIRECT' && isUserOnline(conv.participants.find(p => p.userId !== user?.id)?.userId || '') && (
                      <span className="absolute bottom-0.5 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-low rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors">
                        {getConversationTitle(conv)}
                      </h3>
                      <span className="text-xs font-bold text-outline shrink-0">
                        {conv.lastMessage ? new Date(conv.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                      {conv.lastMessage ? `${conv.lastMessage.senderId === user?.id ? 'You: ' : ''}${conv.lastMessage.content}` : 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Active Chat Window */}
          <section className="flex flex-col flex-1 bg-surface-container-lowest md:h-full rounded-[2rem] overflow-hidden shadow-[0_12px_40px_-12px_rgba(139,78,62,0.15)] border border-surface-container h-[600px] md:h-auto z-10 relative">
            
            {!selectedConversationId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-60">
                <div className="bg-primary-container/20 p-6 rounded-full mb-6">
                  <MessageSquare size={64} className="text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Your Space</h3>
                <p className="max-w-xs mx-auto text-sm font-medium">Select a friend to start sharing moments and memories in real-time.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <header className="h-20 px-6 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={getConversationAvatar(selectedConversation!)} 
                        alt={getConversationTitle(selectedConversation!)} 
                        className="w-11 h-11 rounded-full object-cover border border-outline-variant/20"
                        referrerPolicy="no-referrer"
                      />
                      {selectedConversation!.type === 'DIRECT' && isUserOnline(selectedConversation!.participants.find(p => p.userId !== user?.id)?.userId || '') && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-lowest rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none mb-1">
                        {getConversationTitle(selectedConversation!)}
                      </h3>
                      <p className={`text-xs font-bold ${selectedConversation!.type === 'DIRECT' && isUserOnline(selectedConversation!.participants.find(p => p.userId !== user?.id)?.userId || '') ? 'text-tertiary' : 'text-outline'}`}>
                        {selectedConversation!.type === 'DIRECT' ? (isUserOnline(selectedConversation!.participants.find(p => p.userId !== user?.id)?.userId || '') ? 'Online' : 'Offline') : `${selectedConversation!.participants.length} members`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 md:p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 md:p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                      <Video size={20} />
                    </button>
                    <button className="hidden md:block p-3 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full active:scale-95">
                      <Info size={20} />
                    </button>
                  </div>
                </header>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scroll-smooth bg-surface-bright pb-32 md:pb-6">
                  {loadingHistory && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-primary opacity-40" size={24} />
                    </div>
                  )}

                  {messages.map((msg) => {
                    const sender = selectedConversation?.participants.find(p => p.userId === msg.senderId);
                    const senderName = msg.senderName || sender?.displayName || sender?.username || 'Unknown';
                    const senderAvatar = msg.senderAvatar || sender?.avatarUrl || `https://ui-avatars.com/api/?name=${senderName}`;

                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.senderId === user?.id ? 'flex-row-reverse ml-auto' : ''}`}>
                        <img 
                          src={senderAvatar} 
                          alt={senderName} 
                          className="w-8 h-8 rounded-full object-cover mt-2 shrink-0 border border-outline-variant/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : ''}`}>
                          {selectedConversation?.type === 'GROUP' && msg.senderId !== user?.id && (
                            <span className="text-[11px] font-bold text-primary mb-1 ml-1 leading-none">
                              {senderName}
                            </span>
                          )}
                          <div className={`
                          p-4 shadow-sm
                          ${msg.senderId === user?.id 
                            ? 'bg-primary-container text-on-primary-container rounded-[1.5rem] rounded-tr-sm' 
                            : 'bg-surface-container text-on-surface rounded-[1.5rem] rounded-tl-sm'
                          }
                          ${msg.attachments?.[0] ? 'p-2' : ''}
                        `}>
                          {msg.attachments?.[0] ? (
                            <div className="rounded-xl overflow-hidden shadow-sm">
                              <img 
                                src={msg.attachments[0].url} 
                                alt="Shared memory" 
                                className="w-full max-h-[300px] object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <p className="text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-outline-variant mt-1.5 px-1">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typingUserNames.length > 0 && (
                    <div className="flex gap-3 max-w-[80%] animate-pulse duration-1000">
                      <div className="w-8 h-8 rounded-full bg-primary-container/30 border border-outline-variant/20 flex items-center justify-center shrink-0 mt-2">
                        <Edit3 size={14} className="text-primary" />
                      </div>
                      <div className="bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-full rounded-tl-none shadow-sm flex items-center gap-2">
                        <p className="text-xs md:text-sm font-bold">
                          {typingUserNames.length === 1 
                            ? `${typingUserNames[0]} is typing...`
                            : typingUserNames.length > 1
                            ? `${typingUserNames.slice(0, -1).join(', ')} and ${typingUserNames.slice(-1)} are typing...`
                            : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t border-surface-container bg-surface-container-lowest shrink-0 absolute bottom-0 left-0 right-0 z-20 md:relative">
                  <form 
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 md:gap-4 bg-surface-container-low p-2 pr-2.5 rounded-full border-2 border-transparent focus-within:border-primary-container focus-within:bg-surface-container-lowest transition-all shadow-sm"
                  >
                    <button 
                      type="button"
                      className="p-2.5 text-primary hover:bg-primary-container/20 rounded-full transition-colors shrink-0"
                    >
                      <PlusCircle size={22} />
                    </button>
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        sendTyping(e.target.value.length > 0);
                      }}
                      onBlur={() => sendTyping(false)}
                      placeholder="Write a warm message..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-medium py-2 px-1 outline-none text-on-surface placeholder:text-on-surface-variant/70 min-w-0"
                    />
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      <button 
                        type="button"
                        className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors hidden sm:block"
                      >
                        <Smile size={22} />
                      </button>
                      <button 
                        type="submit"
                        disabled={!messageText.trim()}
                        className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 ${
                          messageText.trim() 
                            ? 'bg-primary text-white shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:-translate-y-0.5 active:scale-95' 
                            : 'bg-primary-container text-on-primary-container/50 shadow-sm cursor-not-allowed'
                        }`}
                      >
                        <Send size={18} className="ml-0.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
            
          </section>

        </div>

        {/* Create Group Chat Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseCreateGroup}
            />
            
            {/* Modal */}
            <div className="relative bg-surface-container-lowest rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4 border-b border-outline-variant/10 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-container rounded-full">
                      <Users size={20} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface tracking-tight">New Group Chat</h3>
                  </div>
                  <button 
                    onClick={handleCloseCreateGroup}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant font-medium ml-[52px]">Add at least 2 members to create a group</p>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Group Name Input */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Project Team, Study Group..."
                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm font-medium focus:ring-0 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/60"
                    autoFocus
                  />
                </div>

                {/* Selected Members Chips */}
                {selectedMembers.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                      Members ({selectedMembers.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(member => (
                        <div 
                          key={member.id}
                          className="flex items-center gap-2 bg-primary-container/30 text-on-surface pl-1 pr-2 py-1 rounded-full group hover:bg-primary-container/50 transition-colors"
                        >
                          <img 
                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.username}&background=random`}
                            alt={member.username}
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-bold truncate max-w-[100px]">
                            {member.displayName || member.username}
                          </span>
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-0.5 hover:bg-error/20 rounded-full transition-colors text-on-surface-variant hover:text-error"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Users to Add */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Search People</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      placeholder="Type a name to search..."
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-tertiary-container rounded-xl px-4 py-3 pl-11 text-sm font-medium focus:ring-0 transition-all outline-none text-on-surface placeholder:text-on-surface-variant/60"
                    />
                    <Search size={18} className="absolute left-4 top-3.5 text-outline-variant" />
                  </div>

                  {/* Search Results */}
                  {groupSearchQuery.trim().length >= 2 && (
                    <div className="mt-2 bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 max-h-[200px] overflow-y-auto">
                      {isGroupSearching ? (
                        <div className="p-4 flex justify-center">
                          <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                      ) : groupSearchResults.length > 0 ? (
                        groupSearchResults.map(result => (
                          <div
                            key={result.id}
                            onClick={() => handleAddMember(result)}
                            className="flex items-center gap-3 p-3 hover:bg-primary-container/20 cursor-pointer transition-colors border-b border-outline-variant/5 last:border-0"
                          >
                            <img 
                              src={result.avatarUrl || `https://ui-avatars.com/api/?name=${result.username}&background=random`}
                              alt={result.username}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-on-surface truncate">{result.displayName || result.username}</p>
                              <p className="text-xs text-on-surface-variant truncate">@{result.username}</p>
                            </div>
                            <div className="p-1.5 bg-primary-container/30 rounded-full text-primary shrink-0">
                              <UserPlus size={16} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-on-surface-variant">No users found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-outline-variant/10 shrink-0 flex justify-end gap-3">
                <button
                  onClick={handleCloseCreateGroup}
                  className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroupChat}
                  disabled={!groupName.trim() || selectedMembers.length < 2 || isCreatingGroup}
                  className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all flex items-center gap-2 ${
                    groupName.trim() && selectedMembers.length >= 2 && !isCreatingGroup
                      ? 'bg-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                      : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                  }`}
                >
                  {isCreatingGroup ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Create Group
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={errorDialog.isOpen}
        title="Attention"
        message={errorDialog.message}
        confirmLabel="OK"
        cancelLabel="Close"
        type="warning"
        onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
        onCancel={() => setErrorDialog({ ...errorDialog, isOpen: false })}
      />
    </Layout>
  );
}

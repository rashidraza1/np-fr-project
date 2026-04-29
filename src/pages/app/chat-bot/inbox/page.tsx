'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { ensureToken } from '@/lib/auth-guest';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { Bot, Send, User, Clock, MessageSquare, Smile, Mic, MicOff, Search, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Visitor {
  id: string;
  name: string;
  email?: string;
  last_page_url?: string;
}

interface BotType {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  Visitor: Visitor;
  Bot: BotType;
  status: string;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  conversation_id: string;
  content: string;
  sender_type: 'visitor' | 'bot' | 'agent';
  sender_id?: string;
  createdAt: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const emojis = ['😊', '😂', '😍', '👍', '🙏', '🔥', '👋', '🤔', '🙌', '🎉', '💡', '✨'];

  useEffect(() => {
    const initialize = async () => {
      try {
        await ensureToken();
        
        // Connect to Socket.io server
        const token = Cookies.get('token');
        const newSocket = io(import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000', {
           auth: { token }
        });
        setSocket(newSocket);

        // Fetch initial conversations
        const fetchConversations = async () => {
          try {
            const res = await api.get('/conversations');
            setConversations(res.data);
          } catch (err) {
            console.error('Error fetching conversations', err);
          }
        };
        fetchConversations();
        
        return newSocket;
      } catch (err) {
        console.error('Inbox initialization failed', err);
        return null;
      }
    };

    let activeSocket: Socket | null = null;
    initialize().then(s => {
      activeSocket = s;
    });

    return () => {
      if (activeSocket) activeSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_message', (msg: Message) => {
       if (activeConversation && msg.conversation_id === activeConversation.id) {
          setMessages(prev => [...prev, msg]);
       }
       
       // Update conversations list: move the updated conversation to the top
       setConversations((prev: Conversation[]) => {
          const convIndex = prev.findIndex(c => c.id === msg.conversation_id);
          if (convIndex !== -1) {
             const updatedConv = { 
                ...prev[convIndex], 
                updatedAt: msg.createdAt 
             };
             // Remove the old version and put the new one at the top
             const otherConversations = prev.filter(c => c.id !== msg.conversation_id);
             return [updatedConv, ...otherConversations];
          }
          return prev;
       });
    });

    socket.on('agent_joined', () => {
       if (activeConversation) {
          setActiveConversation(prev => prev ? { ...prev, status: 'human_handover' } : null);
       }
    });

    return () => {
      socket.off('new_message');
      socket.off('agent_joined');
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/conversations/${activeConversation.id}/messages`);
          setMessages(res.data);
          
          // Join socket room
          if (socket) {
             const token = Cookies.get('token');
             if (token) {
               const payload = JSON.parse(atob(token.split('.')[1]));
               socket.emit('agent_join', { 
                 conversationId: activeConversation.id, 
                 agentId: payload.id 
               });
             }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [activeConversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;
    
    const token = Cookies.get('token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));

    socket.emit('send_message', {
       conversationId: activeConversation.id,
       content: newMessage,
       senderType: 'agent',
       senderId: payload.id
    });

    // Immediately move this conversation to the top in the sidebar
    setConversations(prev => {
       const convIndex = prev.findIndex(c => c.id === activeConversation.id);
       if (convIndex !== -1) {
          const updatedConv = { 
             ...prev[convIndex], 
             updatedAt: new Date().toISOString()
          };
          const otherConversations = prev.filter(c => c.id !== activeConversation.id);
          return [updatedConv, ...otherConversations];
       }
       return prev;
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      setNewMessage(prev => prev + finalTranscript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const filteredConversations = conversations
    .filter(c => 
      c.Visitor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.Bot?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  return (
    <div className="bg-background-paper shadow-sm rounded-xl border border-grey-100 flex h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* Conversations List */}
      <div className="w-1/3 border-r border-grey-200 flex flex-col bg-grey-25/50 backdrop-blur-sm">
        <div className="p-5 border-b border-grey-200">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary">Inbox</h2>
              <span className="bg-primary text-text-contrast text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">{conversations.length} Active</span>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background-paper border border-grey-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-text-secondary px-6 text-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No conversations found</p>
             </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map(conv => (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all relative ${
                    activeConversation?.id === conv.id 
                      ? 'bg-background-paper shadow-md border border-grey-100 ring-1 ring-primary/10' 
                      : 'hover:bg-background-paper/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-text-contrast shadow-sm ${activeConversation?.id === conv.id ? 'bg-primary' : 'bg-grey-300'}`}>
                           {conv.Visitor?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                           <h4 className="text-sm font-semibold text-text-primary truncate w-32">
                              {conv.Visitor?.name || 'Anonymous'}
                           </h4>
                           <p className="text-[10px] text-text-secondary flex items-center">
                              <Bot className="w-3 h-3 mr-1" /> {conv.Bot?.name || 'Bot'}
                           </p>
                        </div>
                     </div>
                     <span className="text-[10px] font-medium text-text-secondary">
                        {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <div className="flex items-center mt-2 justify-between">
                     <div className="flex space-x-1">
                        {conv.status === 'human_handover' ? (
                          <span className="text-[9px] font-bold text-warning-dark bg-warning-light/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">Human</span>
                        ) : (
                          <span className="text-[9px] font-bold text-success-dark bg-success-light/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">AI Bot</span>
                        )}
                     </div>
                     <ChevronRight className={`h-4 w-4 text-grey-300 transition-transform ${activeConversation?.id === conv.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-background-paper">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-grey-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-text-primary">{activeConversation.Visitor?.name || 'Anonymous'}</p>
                  <div className="text-xs text-text-secondary flex items-center">
                     {activeConversation.Visitor?.email || 'No email provided'}
                     <Clock className="w-3 h-3 mx-1 ml-3" /> 
                     Visiting: {activeConversation.Visitor?.last_page_url || 'Unknown page'}
                  </div>
                </div>
              </div>
              <div>
                 {activeConversation.status === 'active' && (
                   <button
                     onClick={() => {
                        const token = Cookies.get('token');
                        if (token && socket) {
                          const payload = JSON.parse(atob(token.split('.')[1]));
                          socket.emit('agent_join', { 
                             conversationId: activeConversation.id, 
                             agentId: payload.id 
                           });
                        }
                     }}
                     className="text-xs font-medium px-3 py-1.5 bg-warning-light/20 text-warning-dark hover:bg-warning-light/40 rounded-md transition-colors"
                   >
                     Take Over Chat
                   </button>
                 )}
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background custom-scrollbar">
              {activeConversation.status === 'active' && (
                 <div className="flex items-center justify-center mb-6">
                    <div className="bg-primary-light/10 backdrop-blur-sm border border-primary-light/20 text-primary text-xs px-4 py-2 rounded-full flex items-center shadow-sm font-medium">
                       <Bot className="w-4 h-4 mr-2 animate-bounce" />
                       AI is currently automating this conversation
                    </div>
                 </div>
              )}
              {messages.map((msg, i) => {
                const isVisitor = msg.sender_type === 'visitor';
                return (
                  <div key={i} className={`flex ${isVisitor ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[75%] rounded-[20px] px-4 py-3 shadow-sm relative group ${
                      isVisitor 
                        ? 'bg-background-paper border border-grey-100 text-text-primary rounded-tl-none' 
                        : msg.sender_type === 'bot' 
                           ? 'bg-primary-light/10 text-primary-dark rounded-tr-none border border-primary-light/20 ring-1 ring-primary/10'
                           : 'bg-primary text-text-contrast rounded-tr-none shadow-primary/10'
                    }`}>
                      {msg.sender_type === 'bot' && (
                        <div className="text-[9px] font-black text-primary-light uppercase tracking-widest mb-1 flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary-light rounded-full mr-1.5 animate-pulse"></span>
                          AI Agent
                        </div>
                      )}
                      <div className="markdown-content text-sm leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div className={`mt-2 flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                         <Clock className="w-2.5 h-2.5 text-text-secondary" />
                         <span className="text-[9px] text-text-secondary font-medium">
                            {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-5 bg-background-paper border-t border-grey-100 relative">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-5 mb-2 p-3 bg-background-paper/95 backdrop-blur-md border border-grey-100 rounded-2xl shadow-xl z-10 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="grid grid-cols-6 gap-1">
                    {emojis.map(e => (
                      <button key={e} onClick={() => {setNewMessage(p => p + e); setShowEmojiPicker(false);}} className="text-xl p-2 hover:bg-primary-light/10 rounded-lg transition-transform hover:scale-110 active:scale-95">{e}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3 w-full">
                <div className="flex-1 flex items-center bg-background border border-grey-200 rounded-2xl px-1 focus-within:ring-2 focus-within:ring-primary/40 transition-all min-w-0">
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${showEmojiPicker ? 'text-primary bg-primary-light/10' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isListening ? 'Listening...' : "Reply to visitor..."}
                    className="flex-1 bg-transparent py-3 px-2 text-sm text-text-primary focus:outline-none min-w-0"
                  />
                  <button 
                    type="button" 
                    onClick={toggleVoice}
                    className={`p-2 rounded-lg transition-all shrink-0 ${isListening ? 'bg-error text-text-contrast shadow-lg animate-pulse' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary hover:bg-primary-dark text-text-contrast rounded-2xl shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all w-[52px] h-[52px] flex items-center justify-center shrink-0"
                >
                  <Send size={22} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
            <MessageSquare className="h-16 w-16 mb-4 text-grey-300" />
            <p className="text-lg font-medium">No conversation selected</p>
            <p className="text-sm mt-1">Select a chat from the sidebar to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

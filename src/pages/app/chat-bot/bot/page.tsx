'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ensureToken } from '@/lib/auth-guest';
import { Link } from 'react-router-dom';
import { Bot, Plus, Trash2, Edit2, Code, Copy, Check, X } from 'lucide-react';

interface BotData {
  id: string;
  name: string;
  color_theme: string;
  welcome_message: string;
  use_ai: boolean;
  faqs?: any[];
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchBots = async () => {
    try {
      const res = await api.get('/bots');
      setBots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await ensureToken();
        fetchBots();
       } catch (err) {
         console.error('Initialization failed', err);
         setLoading(false);
       }
    };
    initialize();
  }, []);

  const deleteBot = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;
    try {
      await api.delete(`/bots/${id}`);
      fetchBots();
    } catch (err) {
      console.error(err);
    }
  };

  const getEmbedCode = (id: string | null) => {
    return `<script>\n  (function(){\n    var s=document.createElement("script");\n    s.src="${import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5000'}/widget.js";\n    s.setAttribute("data-bot-id","${id}");\n    document.head.appendChild(s);\n  })();\n</script>`;
  };

  const copyToClipboard = () => {
    if (selectedBotId) {
      navigator.clipboard.writeText(getEmbedCode(selectedBotId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Your Chatbots</h1>
        <Link 
          to="/chat-bot/bot/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-contrast bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Bot
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : bots.length === 0 ? (
        <div className="text-center py-16 bg-background-paper rounded-lg shadow border border-grey-100">
          <Bot className="mx-auto h-12 w-12 text-text-disabled" />
          <h3 className="mt-2 text-sm font-medium text-text-primary">No chatbots</h3>
          <p className="mt-1 text-sm text-text-secondary">Get started by creating a new chatbot.</p>
          <div className="mt-6">
            <Link
              to="/chat-bot/bot/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-text-contrast bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Bot
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-background-paper shadow rounded-lg flex flex-col border border-grey-200 hover:shadow-lg transition-shadow">
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-text-contrast" style={{ backgroundColor: bot.color_theme }}>
                      <Bot size={20} />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-text-primary">{bot.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-text-secondary line-clamp-2">
                  {bot.welcome_message}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${bot.use_ai ? 'bg-success-light/20 text-success-dark' : 'bg-grey-100 text-text-secondary'}`}>
                      {bot.use_ai ? 'AI Enabled' : 'Manual Only'}
                   </span>
                   <span className="text-text-secondary">{bot.faqs?.length || 0} FAQs</span>
                </div>
              </div>
              <div className="border-t border-grey-200 px-6 py-3 flex justify-between bg-grey-25/50 rounded-b-lg">
                <button 
                   onClick={() => {
                    setSelectedBotId(bot.id);
                    setShowEmbedModal(true);
                  }} 
                  className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                >
                  <Code className="mr-1 h-4 w-4" /> Embed
                </button>
                <div className="flex space-x-4">
                  <Link to={`/chat-bot/bot/edit/${bot.id}`} className="text-text-disabled hover:text-text-secondary">
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button onClick={() => deleteBot(bot.id)} className="text-text-disabled hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background-paper rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-grey-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-grey-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-primary">Install Chatbot</h3>
              <button onClick={() => setShowEmbedModal(false)} className="text-text-secondary hover:text-text-primary">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-text-secondary">
                Copy and paste this script tag into your website's <code className="bg-grey-100 px-1 rounded text-primary font-mono">{'<head>'}</code> or before the closing <code className="bg-grey-100 px-1 rounded text-primary font-mono">{'</body>'}</code> tag.
              </p>
              <div className="relative group">
                <pre className="bg-grey-25 p-4 rounded-xl text-xs font-mono text-text-primary overflow-x-auto border border-grey-200">
                  {getEmbedCode(selectedBotId)}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 bg-background-paper shadow-sm border border-grey-200 rounded-lg hover:bg-grey-50 transition-all flex items-center space-x-2 text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-text-secondary" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-6 bg-grey-25/50 border-t border-grey-100 flex justify-end">
              <button 
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

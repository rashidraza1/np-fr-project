'use client';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Bot, Save, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

export default function NewBotPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'My Custom Bot',
    welcome_message: 'Hi there! How can I help you today?',
    color_theme: '#4f46e5',
    use_ai: true,
    faqs: [] as { question: string, answer: string }[],
    prompt: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const removeFaq = (index: number) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bots', formData);
      navigate('/chat-bot/bot');
    } catch (err) {
      console.error(err);
      alert('Failed to save bot');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/chat-bot/bot" className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-grey-100 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Create New Chatbot</h1>
        </div>
        <button 
          type="button"
          onClick={handleSubmit} 
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-contrast bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {loading ? 'Saving...' : 'Save Bot'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-background-paper shadow rounded-xl border border-grey-100 overflow-hidden text-text-primary">
         <div className="p-8 space-y-8">
           {/* General Info */}
           <div>
             <h3 className="text-lg leading-6 font-medium text-text-primary flex items-center">
               <Bot className="mr-2 h-5 w-5 text-primary" /> General Appearance
             </h3>
             <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
               <div className="sm:col-span-3">
                 <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Bot Name</label>
                 <div className="mt-1">
                   <input
                     type="text"
                     name="name"
                     id="name"
                     value={formData.name}
                     onChange={handleChange}
                     className="shadow-sm focus:ring-primary py-3 px-3 border border-grey-300 bg-background-paper text-text-primary focus:border-primary block w-full sm:text-sm rounded-md"
                   />
                 </div>
               </div>

               <div className="sm:col-span-3">
                 <label htmlFor="color_theme" className="block text-sm font-medium text-text-secondary">Theme Color</label>
                 <div className="mt-1 flex items-center space-x-3">
                   <input
                     type="color"
                     name="color_theme"
                     id="color_theme"
                     value={formData.color_theme}
                     onChange={handleChange}
                     className="h-10 w-10 p-0 border-0 rounded-md cursor-pointer"
                   />
                   <span className="text-sm text-text-secondary">{formData.color_theme}</span>
                 </div>
               </div>

               <div className="sm:col-span-6">
                 <label htmlFor="welcome_message" className="block text-sm font-medium text-text-secondary">Welcome Message</label>
                 <div className="mt-1">
                   <textarea
                     id="welcome_message"
                     name="welcome_message"
                     rows={3}
                     value={formData.welcome_message}
                     onChange={handleChange}
                     className="shadow-sm focus:ring-primary bg-background-paper text-text-primary border p-3 border-grey-300 focus:border-primary block w-full sm:text-sm rounded-md"
                   />
                 </div>
               </div>
                <div className="sm:col-span-6">
                   <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary">
                     Agent Prompt (Instructions)
                   </label>
                   <p className="text-xs text-text-secondary mb-2">
                     Define how the AI should behave (e.g. "You are a helpful support agent for RSI Concepts. Answer politely.")
                   </p>
                   <div className="mt-1">
                     <textarea
                       id="prompt"
                       name="prompt"
                       rows={4}
                       placeholder="You are a helpful customer support assistant. Answer clearly and politely."
                       value={formData.prompt || ''}
                       onChange={handleChange}
                       className="shadow-sm focus:ring-primary bg-background-paper text-text-primary border p-3 border-grey-300 focus:border-primary block w-full sm:text-sm rounded-md"
                     />
                   </div>
                </div>
             </div>
           </div>

           <div className="pt-8 border-t border-grey-200">
              <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-lg leading-6 font-medium text-text-primary">AI Capabilities</h3>
                   <p className="text-sm text-text-secondary mt-1">Enable OpenAI to automatically answer complex questions using your Knowledge Base.</p>
                 </div>
                 <div className="flex items-center">
                   <input
                     id="use_ai"
                     name="use_ai"
                     type="checkbox"
                     checked={formData.use_ai}
                     onChange={(e) => setFormData(p => ({ ...p, use_ai: e.target.checked }))}
                     className="h-5 w-5 text-primary focus:ring-primary border-grey-300 rounded cursor-pointer"
                   />
                   <label htmlFor="use_ai" className="ml-2 block text-sm font-medium text-text-primary cursor-pointer">
                     Enable AI Automation
                   </label>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-grey-200">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg leading-6 font-medium text-text-primary">Knowledge Base (FAQs)</h3>
               <button
                 type="button"
                 onClick={addFaq}
                 className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary-light/10 hover:bg-primary-light/20"
               >
                 <PlusCircle className="mr-1 h-4 w-4" /> Add FAQ
               </button>
             </div>
             
             <div className="space-y-4">
               {formData.faqs.length === 0 ? (
                 <p className="text-sm text-text-secondary text-center py-6 border-2 border-dashed border-grey-200 rounded-lg">No FAQs added yet. Add some to train your AI.</p>
               ) : (
                 formData.faqs.map((faq, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-grey-25/50 rounded-lg border border-grey-200 relative group">
                       <div className="flex-1 space-y-4">
                         <input
                           type="text"
                           placeholder="Question (e.g. What are your hours?)"
                           value={faq.question}
                           onChange={(e) => updateFaq(index, 'question', e.target.value)}
                           className="block px-3 py-2 w-full sm:text-sm border-grey-300 border bg-background-paper text-text-primary rounded-md focus:ring-primary focus:border-primary"
                         />
                         <textarea
                           placeholder="Answer (e.g. We are open from 9am to 5pm, Monday to Friday.)"
                           value={faq.answer}
                           rows={2}
                           onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                           className="block px-3 py-2 w-full sm:text-sm border-grey-300 border bg-background-paper text-text-primary rounded-md focus:ring-primary focus:border-primary"
                         />
                       </div>
                       <button
                         type="button"
                         onClick={() => removeFaq(index)}
                         className="text-gray-400 hover:text-red-500 self-start p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  ))
               )}
             </div>
           </div>

         </div>
      </form>
    </div>
  );
}

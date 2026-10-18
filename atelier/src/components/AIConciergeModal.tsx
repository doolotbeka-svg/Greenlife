import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

export const AIConciergeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { lang, t } = useLanguage();
  const { currency, currencySymbol } = useCurrency();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: t.aiConcierge.initialGreeting,
      time: '00:00'
    }
  ]);

  // Update initial message if language changes and chat is fresh
  useEffect(() => {
    setMessages([
      {
        id: `init-${lang}`,
        role: 'assistant',
        text: t.aiConcierge.initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [lang, t.aiConcierge.initialGreeting]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          currency,
          userMessage: text.trim(),
          messages: messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.text
          }))
        })
      });

      const data = await response.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || t.aiConcierge.initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackResponses: Record<string, Record<string, string>> = {
        ru: {
          default: 'Благодарю за вопрос. Наше ателье специализируется на нестандартных архитектурных сопряжениях с допуском до 0.5 мм. Вы можете отправить файл дизайн-проекта в форме внизу страницы для точной сметы от главного конструктора.',
          шпон: 'Для кухни мы рекомендуем термостабилизированный шпон американского ореха или копченого эвкалипта под матовым лаком 3 Gloss с защитой от влаги и пара.',
          мрамор: 'Стык мрамора со шпоном мы выполняем под 45 градусов. Под каменный слэб изготавливается скрытый стальной силовой подрамник.'
        },
        en: {
          default: 'Thank you for your inquiry. Our atelier specializes in bespoke architectural junctions with 0.5 mm tolerances. You can submit your blueprints via the form below for an engineering estimate.',
          шпон: 'For kitchen fronts, we recommend thermally stabilized American walnut or fumed eucalyptus sealed with a 3 Gloss silk-matte protective lacquer.',
          мрамор: 'We execute 45-degree bevelled miter joints between marble and veneer, reinforced with hidden structural steel frames.'
        },
        ky: {
          default: 'Сурооңуз үчүн рахмат. Биздин ателье 0.5 мм тактыктагы архитектуралык эмеректерге адистешкен. Дизайн-долбооруңузду төмөнкү форма аркылуу жөнөтсөңүз болот.',
          шпон: 'Ашкана үчүн америкалык жаңгак же эвкалипт шпону сунушталат. Алар нымга жана бууга туруктуу матовый лак менен капталат.',
          мрамор: 'Мрамор менен жыгачтын биригүүсүн 45 градус фаска менен жасайбыз жана ички болот подрамник менен бекемдейбиз.'
        }
      };

      const langFallbacks = fallbackResponses[lang] || fallbackResponses.ru;
      let answer = langFallbacks.default;
      const lower = text.toLowerCase();
      if (lower.includes('шпон') || lower.includes('veneer')) answer = langFallbacks.шпон || langFallbacks.default;
      else if (lower.includes('мрамор') || lower.includes('marble') || lower.includes('таш')) answer = langFallbacks.мрамор || langFallbacks.default;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Circle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-[#181615] text-[#B38E5D] border-2 border-[#B38E5D] flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-[#B38E5D] hover:text-black transition-all duration-200 cursor-pointer group focus:outline-none"
            aria-label={t.aiConcierge.btnAria}
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B38E5D] rounded-full border-2 border-[#141312]" />
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#181615] border border-white/10 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#141312] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B38E5D]/15 text-[#B38E5D] flex items-center justify-center border border-[#B38E5D]/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-1.5">
                  <span>{t.aiConcierge.headerTitle}</span>
                  <span className="text-[10px] text-[#B38E5D] font-mono border border-[#B38E5D]/30 px-1 py-0.2 rounded">
                    AI · {lang.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  {t.aiConcierge.headerSub}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-sm hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#161413]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#B38E5D]/20 text-[#B38E5D] flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-sm p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#B38E5D] text-[#141312] font-medium'
                      : 'bg-[#1E1C1A] text-neutral-200 border border-white/5 font-light'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1 text-right font-mono ${
                      m.role === 'user' ? 'text-black/60' : 'text-neutral-500'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B38E5D]" />
                <span>{t.aiConcierge.loading}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2.5 bg-[#141312] border-t border-white/5 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {t.aiConcierge.prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-neutral-300 rounded-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer border border-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#141312] border-t border-white/10 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder={t.aiConcierge.placeholder}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-[#1A1816] border border-white/10 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#B38E5D] placeholder:text-neutral-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-[#B38E5D] text-black hover:bg-[#9E7C4F] hover:text-white transition-colors rounded-sm disabled:opacity-40 cursor-pointer"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

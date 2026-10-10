import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw, MessageCircle } from 'lucide-react';
import { Language } from '../i18n/translations';
import { SellerSettings } from '../types/store';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AIChatBotProps {
  language: Language;
  sellerSettings: SellerSettings;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ language, sellerSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: language === 'ky'
          ? 'Саламатсызбы! Мен Greenleaf Osh эко-дүкөнүнүн жасалма интеллект жардамчысымын. Продукциялар, Ош шаарындагы кампа, баалар жана жеткирүү боюнча суроолоруңузга жооп берүүгө даярмын!'
          : 'Здравствуйте! Я AI-консультант магазина Greenleaf в г. Ош. Готов помочь с выбором эко-продукции, рассказать о наличии на складе в Оше, ценах и условиях доставки!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickQuestions = language === 'ky'
    ? [
        'Кир жуугуч пластиналар кантип иштейт?',
        'Sealuxe сывороткасынын баасы канча?',
        'Ош шаары боюнча жеткирүү кандай?',
        '50% арзандатуу менен кантип алса болот?',
      ]
    : [
        'Как работают пластины для стирки Kardli?',
        'Сколько стоит сыворотка Sealuxe?',
        'Какие условия доставки в г. Ош?',
        'Как покупать со скидкой 50%?',
      ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 6000);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
        signal: abortCtrl.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || (language === 'ky' ? 'Кечиресиз, жооп келген жок.' : 'Извините, не удалось получить ответ.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback helpful offline reply
      const fallbackReply = language === 'ky'
        ? `Биздин кампа Кыргызстан, Ош шаарында жайгашкан. Бардык Greenleaf продукциялары 100% түп нуска. Буюртмаңызды тез арада алуу үчүн биздин WhatsApp номерибизге жазсаңыз болот: ${sellerSettings.whatsappPhone}`
        : `Наш склад находится в г. Ош (ул. Курманжан Датка). Вся продукция Greenleaf оригинальная с сертификатами. Для быстрого заказа можете написать менеджеру в WhatsApp: ${sellerSettings.whatsappPhone}`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-[#1B4332] hover:bg-[#143427] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 border border-[#3E7056] group"
          aria-label={language === 'ky' ? 'ИИ Консультантты ачуу' : 'Открыть AI консультанта'}
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#74C69D]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#25D366] rounded-full animate-pulse border-2 border-[#1B4332]" />
          </div>
          <span className="text-xs font-semibold pr-1.5 hidden sm:inline">
            {language === 'ky' ? 'ИИ Жардамчы' : 'AI Консультант'}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[92vw] max-w-[380px] sm:max-w-[420px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#D5DFD1] flex flex-col overflow-hidden text-left animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#1B4332] text-white p-4 flex items-center justify-between border-b border-[#2A5741]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#275941] flex items-center justify-center text-[#74C69D]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm flex items-center gap-1.5">
                  <span>{language === 'ky' ? 'Greenleaf Osh ИИ Консультант' : 'Greenleaf Osh AI Консультант'}</span>
                </h3>
                <p className="text-[11px] text-[#A7D4B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                  <span>{language === 'ky' ? 'Ош кампасы боюнча онлайн' : 'Онлайн · Склад в г. Ош'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#D8F3DC] hover:text-white rounded-lg transition-colors"
              aria-label="Жабуу"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAF7]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#1B4332] text-[#74C69D] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1B4332] text-white rounded-br-xs'
                      : 'bg-white border border-[#DFE7DB] text-[#1E3326] shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-[#95C7A8]' : 'text-[#829989]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#E2EDE0] text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#526B5C] bg-white p-2.5 rounded-xl border border-[#DFE7DB] max-w-[70%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D6A4F]" />
                <span>{language === 'ky' ? 'ИИ жооп даярдап жатат...' : 'AI подбирает ответ...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-[#E5ECE1] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-[#EEF5EC] hover:bg-[#E0EDE0] text-[#1B4332] rounded-full text-[11px] whitespace-nowrap transition-colors border border-[#CFDFCD]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#DFE7DB] flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'ky' ? 'Сурооңузду жазыңыз...' : 'Задайте вопрос о товарах...'}
              className="flex-1 px-3.5 py-2 text-xs bg-[#F4F7F2] border border-[#CBD7C7] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-[#143427]"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-[#1B4332] hover:bg-[#143427] disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              aria-label="Жөнөтүү"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

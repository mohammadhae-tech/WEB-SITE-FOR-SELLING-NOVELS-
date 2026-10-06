import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Phone, ShoppingBag, ExternalLink, Headphones, ArrowRight, HelpCircle, BookOpen, Truck, Percent, ShieldCheck, FileText, Paperclip, Sparkles, X, Lock, Key, LogOut, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';
import { CONTACT_PHONE } from '../data/novelsData';
import { BookItem } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  attachedFileName?: string;
  actionButtons?: Array<{
    label: string;
    action: string;
    payload?: string;
  }>;
}

interface TelegramBotViewProps {
  onOrder: (bookTitle: string) => void;
  onBooksUpdated?: (books: BookItem[]) => void;
}

export const TelegramBotView: React.FC<TelegramBotViewProps> = ({ onOrder, onBooksUpdated }) => {
  const { isAdmin, adminUser, login, logout, getAuthHeaders } = useAdminAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Admin Login Modal state
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [loginUserInput, setLoginUserInput] = useState('');
  const [loginPassInput, setLoginPassInput] = useState('');
  const [loginModalError, setLoginModalError] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `سلام! به ربات پاسخگوی آنلاین «ممدکتاب» خوش آمدید 🤖📚\n\nکلیه کتاب‌های چاپی با ۵۰٪ تخفیف ویژه و ارسال با پست پیشتاز (۱۰۰ هزار تومان برای هر جلد کتاب کاغذی) تقدیم می‌گردد.\n\nفایل‌های صوتی و PDF در تلگرام t.me/mamadketab ۱۰۰٪ رایگان است.\nپیج‌های اینستاگرام: @mamadketab1 و @mamadadketab2\n\n🔒 **قوانین دسترسی سامانه:**\nتغییر قیمت کتاب‌ها، اصلاح درصد تخفیف و صدور هرگونه دستور ویرایشی منحصراً برای **ادمین (با نام کاربری و پسورد: ادمین 5)** امکان‌پذیر است و دسترسی سایرین محدود می‌باشد. کاربران عادی می‌توانند جهت مشاوره، استعلام و ثبت سفارش از ربات استفاده نمایند.\n\nشماره تماس مستقیم پشتیبانی: **09902011726**`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '📞 شماره تلفن تماس پشتیبانی چنده؟', action: 'ask', payload: 'شماره تلفن تماس پشتیبانی چنده؟' },
        { label: '📦 هزینه ارسال پستی چقدره؟', action: 'ask', payload: 'هزینه ارسال پستی چقدره؟' },
        { label: '📖 تخفیف نسخه چاپی چقدره؟', action: 'ask', payload: 'تخفیف نسخه چاپی چقدره؟' },
        { label: '🎧 فایل صوتی و PDF رایگانه؟', action: 'ask', payload: 'فایل صوتی و PDF رایگانه؟' },
        { label: '🛒 ثبت سفارش (۵۰٪ تخفیف)', action: 'order', payload: '' },
        { label: '📥 دانلود فایل نهایی پروژه (ZIP)', action: 'download_project' },
        { label: '📢 کانال تلگرام ممدکتاب (t.me/mamadketab)', action: 'telegram_link' }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAdminModalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginModalError('');
    const res = login(loginUserInput, loginPassInput);
    if (res.success) {
      setShowAdminLoginModal(false);
      setLoginUserInput('');
      setLoginPassInput('');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `✅ **ورود موفقیت‌آمیز به عنوان ادمین 5**\nشما اکنون به امکانات ویژه ادمین دسترسی دارید:\n۱. امکان ارسال دستور به چت‌بات برای تغییر قیمت‌ها و درصد تخفیف\n۲. امکان آپلود فایل PDF لیست قیمت جهت بروزرسانی خودکار دیتابیس سایت.`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setLoginModalError(res.error || 'نام کاربری یا کلمه عبور اشتباه است.');
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      setShowAdminLoginModal(true);
      return;
    }
    if (e.target.files && e.target.files[0]) {
      setAttachedPdf(e.target.files[0]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() && !attachedPdf) return;

    // Check client-side permission
    const lower = text.toLowerCase();
    const isCommandOrPriceChange =
      (lower.includes('قیمت') && (lower.includes('کن') || lower.includes('بکن') || lower.includes('بذار') || lower.includes('بزار') || lower.includes('قرار') || lower.includes('تغییر') || lower.includes('اصلاح') || lower.includes('عوض') || lower.includes('تنظیم') || lower.includes('دستور'))) ||
      lower.includes('دستور') ||
      (lower.includes('تخفیف') && (lower.includes('کن') || lower.includes('بکن') || lower.includes('بذار') || lower.includes('بزار') || lower.includes('تغییر') || lower.includes('اصلاح') || lower.includes('عوض'))) ||
      (lower.includes('لیست قیمت') && (lower.includes('اپدیت') || lower.includes('تغییر') || lower.includes('اصلاح') || lower.includes('اعمال') || lower.includes('ثبت')));

    if (!isAdmin && (attachedPdf || isCommandOrPriceChange)) {
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: text.trim() || 'ارسال فایل لیست قیمت',
        attachedFileName: attachedPdf ? attachedPdf.name : undefined,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      if (!textToSend) setInputMessage('');
      setAttachedPdf(null);

      const rejectMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⛔ **دسترسی محدود است:**\nتغییر قیمت کتاب‌ها، اصلاح درصد تخفیف و صدور دستورات ویرایشی به ربات منحصراً برای **ادمین (با نام کاربری و پسورد: ادمین 5)** امکان‌پذیر است.\n\nبه عنوان کاربر عادی، می‌توانید از راهنمایی درباره کتاب‌ها، فایل‌های صوتی و PDF رایگان در تلگرام و ثبت سفارش با ۵۰٪ تخفیف استفاده فرمایید.`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        actionButtons: [
          { label: '🔑 ورود به عنوان ادمین 5', action: 'admin_login' },
          { label: '🛒 ثبت سفارش (۵۰٪ تخفیف)', action: 'order', payload: '' },
          { label: '📞 تماس با پشتیبانی (09902011726)', action: 'call' }
        ]
      };
      setMessages(prev => [...prev, rejectMsg]);
      return;
    }

    let pdfBase64 = '';
    if (attachedPdf) {
      pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(attachedPdf);
      });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim() || 'فایل پیوست لیست قیمت ارسال گردید.',
      attachedFileName: attachedPdf ? attachedPdf.name : undefined,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setAttachedPdf(null);
    setIsTyping(true);

    try {
      // Call backend online bot API route with price update support & auth headers
      const res = await fetch('/api/bot-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          message: text,
          pdfBase64
        })
      });

      const data = await res.json();
      const replyText = data.reply || 'متأسفانه مشکلی در پاسخگویی رخ داد. لطفا با شماره 09902011726 تماس بگیرید.';

      if (data.books && onBooksUpdated) {
        onBooksUpdated(data.books);
      }

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        actionButtons: [
          { label: '🛒 ثبت سفارش', action: 'order', payload: '' },
          { label: '📞 تماس تلفنی با 09902011726', action: 'call' },
          { label: '📢 عضویت در کانال تلگرام', action: 'telegram_link' }
        ]
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `پاسخ پشتیبانی: تمامی فایل‌های صوتی و PDF در کانال تلگرام t.me/mamadketab ۱۰۰٪ رایگان هستند. ثبت سفارش با ۵۰٪ تخفیف و ۱۰۰ هزار تومان پست ارسال می‌شود.\nشماره تماس: ${CONTACT_PHONE}`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionButton = (btn: { label: string; action: string; payload?: string }) => {
    if (btn.action === 'order') {
      onOrder(btn.payload || '');
    } else if (btn.action === 'ask' && btn.payload) {
      handleSendMessage(btn.payload);
    } else if (btn.action === 'telegram_link') {
      window.open('https://t.me/mamadketab', '_blank');
    } else if (btn.action === 'admin_login') {
      setShowAdminLoginModal(true);
    } else if (btn.action === 'download_project') {
      window.location.href = '/api/download-project';
    } else if (btn.action === 'call') {
      window.open(`tel:${CONTACT_PHONE}`, '_self');
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[780px] text-slate-100 relative">
      
      {/* Bot Chat Header */}
      <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          
          {/* Book Emblem Avatar */}
          <div className="relative">
            <div className="w-12 h-14 rounded-xl overflow-hidden border border-emerald-400/80 shadow bg-slate-900 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=200&auto=format&fit=crop"
                alt="لوگوی کانال ممدکتاب"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full absolute bottom-0 left-0 animate-ping" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base text-emerald-100">ربات پاسخگوی آنلاین ممدکتاب</h3>
              {isAdmin ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>دسترسی ادمین ۵ (مجاز به تغییر قیمت)</span>
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>کاربر عادی (دستورات قیمت محدود)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              اینستاگرام: <span className="text-pink-300 font-bold font-mono dir-ltr">@mamadketab1</span> و <span className="text-purple-300 font-bold font-mono dir-ltr">@mamadadketab2</span> | تماس: <span className="text-amber-300 font-mono font-bold dir-ltr">{CONTACT_PHONE}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isAdmin ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              title="خروج از حالت ادمین"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج ادمین</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              title="ورود ادمین جهت صدور دستور و اصلاح قیمت"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ورود ادمین ۵</span>
            </button>
          )}

          <a
            href={`tel:${CONTACT_PHONE}`}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all dir-ltr"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{CONTACT_PHONE}</span>
          </a>

          <a
            href="https://t.me/mamadketab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>کانال تلگرام</span>
          </a>
        </div>
      </div>

      {/* Suggested Quick Questions Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 px-4 overflow-x-auto flex items-center gap-2 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>سوالات سریع:</span>
        </span>
        
        <button
          onClick={() => handleSendMessage('شماره تلفن تماس پشتیبانی چنده؟')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors"
        >
          📞 شماره تماس
        </button>

        <button
          onClick={() => handleSendMessage('هزینه ارسال پستی چقدره؟')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors"
        >
          📦 هزینه پست ۱۰۰ هزار تومان
        </button>

        <button
          onClick={() => handleSendMessage('تخفیف کتاب‌ها چقدره؟')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors"
        >
          📖 ۵۰٪ تخفیف
        </button>

        <button
          onClick={() => handleSendMessage('فایل صوتی و PDF رایگانه؟')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors"
        >
          🎧 صوتی و PDF رایگان
        </button>

        <a
          href="/api/download-project"
          download="mamadketab-final-project.zip"
          className="bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/40 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors font-bold flex items-center gap-1"
          title="دانلود فایل نهایی و سورس کامل پروژه"
        >
          <span>📥 دانلود فایل نهایی (ZIP)</span>
        </a>

        {isAdmin && (
          <button
            onClick={() => handleSendMessage('لیست کتاب‌هایی که نیاز به اصلاح قیمت دارند چیست؟')}
            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors font-bold"
          >
            🏷️ راهنمای دستورات قیمت (ادمین)
          </button>
        )}
      </div>

      {/* Messages Chat Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/70">
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-bold rounded-tl-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tr-none shadow-xl'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.attachedFileName && (
                <div className="bg-slate-950/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-2 text-xs text-sky-300 font-bold">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>فایل پیوست: {msg.attachedFileName}</span>
                </div>
              )}

              {/* Action buttons inside response */}
              {msg.actionButtons && msg.actionButtons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {msg.actionButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionButton(btn)}
                      className="w-full text-right bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>{btn.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 block text-left font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-emerald-300 px-4 py-3 rounded-2xl text-xs w-fit shadow-md">
            <Bot className="w-4 h-4 animate-bounce text-emerald-400" />
            <span>ربات پشتیبان ممدکتاب در حال آماده‌سازی پاسخ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2 shrink-0"
      >
        {attachedPdf && (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>فایل پیوست: {attachedPdf.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedPdf(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,.txt"
            id="bot-pdf-file-input"
            onChange={handleFileAttachment}
            className="hidden"
          />

          <label
            htmlFor={isAdmin ? 'bot-pdf-file-input' : undefined}
            onClick={() => {
              if (!isAdmin) setShowAdminLoginModal(true);
            }}
            title={isAdmin ? 'ارسال PDF لیست قیمت (ادمین)' : 'ارسال PDF لیست قیمت (مخصوص ادمین ۵)'}
            className={`p-3 rounded-2xl cursor-pointer transition-all shrink-0 flex items-center justify-center border ${
              isAdmin
                ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            {isAdmin ? <Paperclip className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </label>

          <input
            type="text"
            placeholder={
              isAdmin
                ? 'دستور تغییر قیمت، اصلاح تخفیف یا سوال خود را بنویسید (مثلاً: قیمت بوف کور را ۲۰۰ هزار تومان بگذار)...'
                : 'سوال خود درباره رمان‌ها، ارسال پستی ۱۰۰ هزار تومان، صوتی/PDF رایگان و سفارش کتاب را بنویسید...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={(!inputMessage.trim() && !attachedPdf) || isTyping}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-2xl font-bold transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Quick Admin Login Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h4 className="font-extrabold text-sm text-emerald-100">احراز هویت ادمین ۵</h4>
              </div>
              <button
                onClick={() => { setShowAdminLoginModal(false); setLoginModalError(''); }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              صدور دستور به چت‌بات، اصلاح قیمت کتاب‌ها، تغییر تخفیف و ارسال PDF لیست قیمت منحصراً با حساب کاربری <span className="text-amber-300 font-bold">ادمین ۵</span> امکان‌پذیر است.
            </p>

            {loginModalError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-xs text-rose-300 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginModalError}</span>
              </div>
            )}

            <form onSubmit={handleAdminModalLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">نام کاربری ادمین</label>
                <input
                  type="text"
                  placeholder="ادمین 5"
                  value={loginUserInput}
                  onChange={(e) => setLoginUserInput(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">کلمه عبور ادمین</label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={loginPassInput}
                  onChange={(e) => setLoginPassInput(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="bg-slate-950/60 p-2 rounded-xl text-[10px] text-slate-400 text-center font-mono">
                نام کاربری: <span className="text-emerald-300 font-bold">ادمین 5</span> | پسورد: <span className="text-emerald-300 font-bold">ادمین 5</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  ورود ادمین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

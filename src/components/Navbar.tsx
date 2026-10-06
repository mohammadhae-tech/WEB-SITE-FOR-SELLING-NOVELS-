import React from 'react';
import { BookOpen, Sparkles, ShoppingBag, Send, ShieldCheck, Bell, Bot, Headphones, Phone, Instagram, Lock, Download } from 'lucide-react';
import { CONTACT_PHONE, INSTAGRAM_ACC1, INSTAGRAM_ACC2, INSTAGRAM_URL_1, INSTAGRAM_URL_2 } from '../data/novelsData';
import { MamadKetabLogo } from './MamadKetabLogo';
import { useAdminAuth } from '../context/AdminAuthContext';

interface NavbarProps {
  activeTab: 'catalog' | 'audio' | 'ai' | 'bot' | 'admin';
  setActiveTab: (tab: 'catalog' | 'audio' | 'ai' | 'bot' | 'admin') => void;
  openOrderModal: (bookTitle?: string) => void;
  unreadCount: number;
  ordersCount: number;
  openNotificationsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openOrderModal,
  unreadCount,
  ordersCount,
  openNotificationsModal
}) => {
  const { isAdmin } = useAdminAuth();
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md text-slate-100 border-b border-emerald-900/40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo Component */}
          <MamadKetabLogo size="md" showSubtitle={true} />

          {/* Customer Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>ویترین و کتاب‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audio'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:text-emerald-200 hover:bg-slate-700/50'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>صوتی و PDF رایگان</span>
            </button>

            <button
              onClick={() => setActiveTab('bot')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bot'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-sky-300 hover:text-sky-200 hover:bg-slate-700/50'
              }`}
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>ربات پاسخگو آنلاین</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300/30" />
              <span>خلاصه‌ساز AI</span>
            </button>
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Prominent Site Admin Entrance Button */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                  : isAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-400'
              }`}
              title="ورود به پنل مدیریت سایت (ادمین 5)"
            >
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isAdmin ? 'پنل مدیریت سایت' : 'ورود مدیریت سایت'}</span>
              {ordersCount > 0 && (
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold border border-emerald-500/40">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Direct Download Final Project ZIP Button */}
            <a
              href="/api/download-project"
              download="mamadketab-final-project.zip"
              className="hidden lg:flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-500/10"
              title="دانلود فایل نهایی و کامل پروژه (فایل ZIP)"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>دانلود فایل نهایی</span>
            </a>

            {/* Direct Phone Contact */}
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="hidden 2xl:flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all dir-ltr"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{CONTACT_PHONE}</span>
            </a>

            {/* Instagram Button */}
            <a
              href={INSTAGRAM_URL_1}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all dir-ltr"
              title="اینستاگرام ممدکتاب ۱"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>@{INSTAGRAM_ACC1}</span>
            </a>

            {/* Telegram Channel Button */}
            <a
              href="https://t.me/mamadketab"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden 2xl:flex items-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>تلگرام</span>
            </a>

            {/* Notification Alert Bell */}
            <button
              onClick={openNotificationsModal}
              className="relative p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all"
              title="اعلا‌ن‌های سیستم"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Order Book CTA Button */}
            <button
              onClick={() => openOrderModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سفارش (۵۰٪ تخفیف)</span>
              <span className="sm:hidden">سفارش</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
              activeTab === 'catalog' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ویترین</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
              activeTab === 'audio' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>رایگان</span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
              activeTab === 'bot' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>پاسخگو</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
              activeTab === 'ai' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>خلاصه</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
              activeTab === 'admin' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>{isAdmin ? 'مدیریت' : 'ورود مدیریت'}</span>
          </button>

          <a
            href="/api/download-project"
            download="mamadketab-final-project.zip"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sky-400 hover:text-sky-300"
            title="دانلود فایل نهایی"
          >
            <Download className="w-4 h-4" />
            <span>دانلود</span>
          </a>
        </div>

      </div>
    </header>
  );
};

import React from 'react';
import { Send, Headphones, FileText, Truck, Percent, Phone, BookOpen, Instagram } from 'lucide-react';
import { CONTACT_PHONE, INSTAGRAM_ACC1, INSTAGRAM_ACC2, INSTAGRAM_URL_1, INSTAGRAM_URL_2 } from '../data/novelsData';

export const MamadKetabBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 text-slate-100 shadow-2xl my-6">
      {/* Ambient glowing background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Information & Multi-line Header */}
        <div className="space-y-4 max-w-2xl text-center lg:text-right flex-1">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>۵۰٪ تخفیف ویژه برای تمام کتاب‌های چاپی</span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>مرجع تخصصی کتاب‌های چاپی، صوتی و PDF</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm dir-ltr">
              <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-mono font-bold">{CONTACT_PHONE}</span>
            </div>
          </div>

          {/* Title on Separate Lines */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-100 leading-snug">
              کانال ممد کتاب
            </h1>
            <div className="text-xl sm:text-2xl font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-2xl inline-block">
              همراه با سفارش کتاب با ۵۰٪ تخفیف
            </div>
            <p className="text-sm sm:text-base font-extrabold text-sky-300 pt-1">
              فایل صوتی و پی دی اف رایگان در کانال تلگرام (t.me/mamadketab)
            </p>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            تمامی فایل‌های صوتی استودیویی و نسخه الکترونیک (PDF) کتاب‌های رمان، تاریخی، فلسفی و کودک به صورت <span className="text-emerald-400 font-extrabold underline">۱۰۰٪ رایگان</span> در کانال تلگرام ممدکتاب در دسترس است. سفارش نسخه چاپی کاغذی کتاب‌ها با ۵۰٪ تخفیف و هزینه ارسال پستی پیشتاز مقطوع <span className="text-amber-300 font-black">۱۰۰,۰۰۰ تومان برای هر جلد کتاب کاغذی</span> انجام می‌شود.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2.5 bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 text-xs text-slate-200">
              <Headphones className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-300">کتاب صوتی ۱۰۰٪ رایگان</div>
                <div className="text-[10px] text-slate-400">دانلود مستقیم در تلگرام</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 text-xs text-slate-200">
              <FileText className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div className="font-bold text-sky-300">دانلود PDF رایگان</div>
                <div className="text-[10px] text-slate-400">نسخه کامل الکترونیک</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 text-xs text-slate-200">
              <Truck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-amber-300">پست پیشتاز (برای هر جلد کاغذی)</div>
                <div className="text-[10px] text-slate-400">۱۰۰ هزار تومان به ازای هر جلد</div>
              </div>
            </div>
          </div>

          {/* Instagram Accounts Showcase */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-xs text-pink-300 font-bold flex items-center gap-1">
              <Instagram className="w-4 h-4 text-pink-400" />
              صفحات رسمی اینستاگرام:
            </span>
            <a
              href={INSTAGRAM_URL_1}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all dir-ltr"
            >
              @{INSTAGRAM_ACC1}
            </a>
            <a
              href={INSTAGRAM_URL_2}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all dir-ltr"
            >
              @{INSTAGRAM_ACC2}
            </a>
          </div>

        </div>

        {/* Right Side: Featured Book Card */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col items-center bg-slate-800/95 border border-emerald-500/40 p-6 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-md">
          
          <div className="relative group w-full">
            <div className="w-28 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-slate-900 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop"
                alt="دو قرن سکوت"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full border border-slate-900 shadow whitespace-nowrap">
              کتاب پیشنهادی
            </span>
          </div>

          <div className="pt-1">
            <h3 className="font-black text-emerald-100 text-base">دو قرن سکوت</h3>
            <p className="text-xs text-amber-300 font-bold mt-0.5">دکتر عبدالحسین زرین‌کوب</p>
            <p className="text-xs text-sky-300 dir-ltr font-mono mt-2 font-bold bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-500/30">
              t.me/mamadketab
            </p>
            <p className="text-xs text-slate-300 mt-2 dir-ltr font-mono font-extrabold text-amber-300">
              📞 {CONTACT_PHONE}
            </p>
          </div>

          <a
            href="https://t.me/mamadketab"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 px-5 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/20"
          >
            <span>ورود به کانال تلگرام</span>
            <Send className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { NovelSummaryResponse } from '../types';
import { Sparkles, BookOpen, Palette, ShoppingBag, Send, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AISummarizerAndPainterProps {
  onOrder: (bookTitle: string) => void;
}

export const AISummarizerAndPainter: React.FC<AISummarizerAndPainterProps> = ({ onOrder }) => {
  const [novelTitle, setNovelTitle] = useState('');
  const [novelAuthor, setNovelAuthor] = useState('');
  const [novelExcerpt, setNovelExcerpt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NovelSummaryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novelTitle.trim()) {
      setErrorMessage('لطفا عنوان رمان را وارد کنید.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setResult(null);

    try {
      const summaryRes = await fetch('/api/summarize-novel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: novelTitle.trim(),
          author: novelAuthor.trim(),
          excerpt: novelExcerpt.trim()
        })
      });

      if (!summaryRes.ok) {
        throw new Error('خطا در ارتباط با سرور هوش مصنوعی.');
      }

      const summaryData: NovelSummaryResponse = await summaryRes.json();

      try {
        const imageRes = await fetch('/api/generate-painting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: summaryData.title || novelTitle,
            prompt: summaryData.paintingPrompt
          })
        });
        const imageData = await imageRes.json();
        if (imageData.paintingUrl) {
          summaryData.paintingUrl = imageData.paintingUrl;
        }
      } catch (imgErr) {
        console.warn('Image generation used fallback:', imgErr);
      }

      setResult(summaryData);
    } catch (err: any) {
      console.error('AI Error:', err);
      setErrorMessage(err.message || 'خطایی در خلاصه‌سازی رمان رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleNovels = [
    { title: 'سووشون', author: 'سیمین دانشور' },
    { title: 'سال‌های ابری', author: 'علی‌اشرف درویشیان' },
    { title: 'صد سال تنهایی', author: 'گابریل گارسیا مارکز' },
    { title: 'جنگ و صلح', author: 'لئو تولستوی' },
    { title: 'گتسبی بزرگ', author: 'اسکات فیتزجرالد' }
  ];

  return (
    <div className="space-y-8 my-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 rounded-3xl text-slate-100 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </span>
          <div>
            <h2 className="text-2xl font-black text-emerald-100">سامانه هوشمند خلاصه‌ساز و تصویرگر رمان</h2>
            <p className="text-xs text-slate-300 mt-1">
              عنوان هر رمانی را وارد کنید تا هوش مصنوعی خلاصه‌ای تحلیلی و تابلوی نقاشی اختصاصی آن را تولید نماید.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <form onSubmit={handleGenerateSummary} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-2">
                عنوان رمان <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="مثلا: بوف کور، سال‌های ابری، ۱۹۸۴..."
                value={novelTitle}
                onChange={(e) => setNovelTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                نام نویسنده (اختیاری)
              </label>
              <input
                type="text"
                placeholder="مثلا: صادق هدایت، جورج اورول..."
                value={novelAuthor}
                onChange={(e) => setNovelAuthor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

          </div>

          {/* Excerpt or Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              توضیحات تکمیلی یا بخشی از متن رمان (اختیاری)
            </label>
            <textarea
              rows={3}
              placeholder="می‌توانید خلاصه کوتاه، پاراگرافی از رمان یا درخواست سبک نقاشی خاص را بنویسید..."
              value={novelExcerpt}
              onChange={(e) => setNovelExcerpt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">پیشنهادهای سریع:</span>
            {sampleNovels.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNovelTitle(item.title);
                  setNovelAuthor(item.author);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition-colors font-bold"
              >
                {item.title}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-6 rounded-xl text-xs shadow-xl shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>در حال تحلیل ادبی رمان و خلق تابلوی نقاشی...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>تولید خلاصه تحلیلی و خلق نقاشی هوشمند</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Result Display */}
      {result && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>خلاصه و نقاشی با موفقیت آماده شد</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-100">{result.title}</h3>
              <p className="text-xs text-slate-400 mt-1">نویسنده: <span className="text-slate-200 font-bold">{result.author || 'نامشخص'}</span></p>
            </div>

            <button
              onClick={() => onOrder(result.title)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ثبت سفارش این کتاب</span>
            </button>
          </div>

          {/* Generated Painting Artwork */}
          {result.paintingUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-emerald-900/40 shadow-xl">
              <img
                src={result.paintingUrl}
                alt={`نقاشی هوشمند رمان ${result.title}`}
                referrerPolicy="no-referrer"
                className="w-full max-h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 right-4 left-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
                  <Palette className="w-4 h-4" />
                  <span>توصیف تابلوی نقاشی هوشمند خلق شده</span>
                </span>
                <p className="text-xs text-slate-300 font-mono dir-ltr text-left">
                  {result.paintingPrompt}
                </p>
              </div>
            </div>
          )}

          {/* Summary Content */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>خلاصه تحلیلی و نقد داستان</span>
            </h4>
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {result.summary}
            </div>
          </div>

          {/* Plot Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-300">سیر پیرنگ و وقایع اصلی رمان</h4>
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
              {result.plotOverview}
            </div>
          </div>

          {/* Key Takeaways and Characters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-300">شخصیت‌های کلیدی</h4>
              <ul className="space-y-2">
                {result.characterAnalysis.map((item, idx) => (
                  <li key={idx} className="bg-slate-800/60 p-3 rounded-xl text-xs text-slate-200 border border-slate-700/50">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-300">نکات و پیام‌های کلیدی</h4>
              <ul className="space-y-2">
                {result.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="bg-slate-800/60 p-3 rounded-xl text-xs text-slate-200 border border-slate-700/50">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Telegram Channel CTA */}
          <div className="bg-emerald-950/60 border border-emerald-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-slate-100">دریافت رایگان فایل صوتی و PDF در تلگرام</h5>
                <p className="text-xs text-slate-400">t.me/mamadketab - کانال رسمی ممدکتاب</p>
              </div>
            </div>

            <a
              href="https://t.me/mamadketab"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shrink-0"
            >
              <span>ورود به کانال تلگرام ممدکتاب</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
};

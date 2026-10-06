import React, { useState } from 'react';
import { BookItem } from '../types';
import { X, BookOpen, Send, ShoppingBag, Headphones, Layers, Users, RefreshCw, FileText, ShieldCheck, Truck, Percent, Building2 } from 'lucide-react';

interface NovelDetailModalProps {
  book: BookItem | null;
  onClose: () => void;
  onOrder: (bookTitle: string) => void;
}

export const NovelDetailModal: React.FC<NovelDetailModalProps> = ({ book, onClose, onOrder }) => {
  const [currentPaintingUrl, setCurrentPaintingUrl] = useState<string>(book?.paintingUrl || '');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customStyle, setCustomStyle] = useState('طرح جلد چاپی کلاسیک');

  if (!book) return null;

  const discountedPrice = Math.round(book.physicalPrice * (1 - book.discountPercent / 100));

  const handleRegeneratePainting = async () => {
    try {
      setIsRegenerating(true);
      const res = await fetch('/api/generate-painting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          prompt: `A professional printed book cover design artwork for the novel "${book.title}", style ${customStyle}, elegant typography, high quality book jacket artwork`
        })
      });
      const data = await res.json();
      if (data.paintingUrl) {
        setCurrentPaintingUrl(data.paintingUrl);
      }
    } catch (e) {
      console.error('Failed to regenerate painting:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-emerald-100">{book.title}</h2>
              <p className="text-xs text-slate-400">
                نویسنده: <span className="text-slate-200 font-bold">{book.author}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* Painting Cover Artwork Section */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-emerald-900/40 shadow-xl group">
            <img
              src={currentPaintingUrl || book.paintingUrl}
              alt={`طرح جلد رمان ${book.title}`}
              referrerPolicy="no-referrer"
              className="w-full max-h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80">
              <div>
                <span className="text-xs text-emerald-400 font-bold block">طرح جلد و تصویرگری هوشمند رمان</span>
                <p className="text-xs text-slate-300 font-mono text-left dir-ltr truncate max-w-md mt-0.5">
                  {book.paintingPrompt}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <select
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold"
                >
                  <option value="طرح جلد چاپی کلاسیک">طرح جلد کلاسیک</option>
                  <option value="رنگ روغن روی بوم">رنگ روغن روی بوم</option>
                  <option value="آبرنگ مدرن">آبرنگ مدرن</option>
                  <option value="مینیاتور اصیل ایرانی">مینیاتور ایرانی</option>
                </select>

                <button
                  onClick={handleRegeneratePainting}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>تولید طرح جدید</span>
                </button>
              </div>
            </div>
          </div>

          {/* Book Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-800 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-1">دسته‌بندی / صفحات</span>
              <span className="font-bold text-slate-200">{book.category} ({book.pagesCount} ص)</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">فایل صوتی و PDF</span>
              <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 inline-block">۱۰۰٪ رایگان</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">ارسال پستی پیشتاز</span>
              <span className="font-bold text-sky-300">۱۰۰,۰۰۰ تومان (برای هر جلد کاغذی)</span>
            </div>
          </div>

          {/* Pricing Options Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>نحوه دریافت و قیمت‌گذاری رمان «{book.title}»</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Free Audio */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-md font-extrabold inline-block mb-1">
                    کانال تلگرام ممدکتاب
                  </span>
                  <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span>کتاب صوتی استودیویی</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">گویندگی حرفه‌ای با موسیقی متن</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">تعرفه دریافت:</span>
                  <span className="text-emerald-400 font-black text-sm">۱۰۰٪ رایگان</span>
                </div>
              </div>

              {/* Free PDF */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-md font-extrabold inline-block mb-1">
                    کانال تلگرام ممدکتاب
                  </span>
                  <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>نسخه کامل PDF</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">حجم فایل: {book.pdfSize || '۱۲.۵ MB'}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">تعرفه دریافت:</span>
                  <span className="text-emerald-400 font-black text-sm">۱۰۰٪ رایگان</span>
                </div>
              </div>

              {/* Physical Book Price with 50% discount */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 relative overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-md font-extrabold inline-block mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-amber-400" />
                    <span>۵۰٪ تخفیف ویژه چاپی</span>
                  </span>
                  <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>نسخه چاپ کاغذی</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">ارسال پستی پیشتاز با درگاه آنلاین شتاب</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">قیمت نهایی:</span>
                  <div className="text-right">
                    <span className="text-slate-500 line-through text-[11px] block">
                      {book.physicalPrice.toLocaleString('fa-IR')} تومان
                    </span>
                    <span className="text-amber-300 font-black text-sm">
                      {discountedPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>خلاصه کامل رمان</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
              {book.fullSummary}
            </p>
          </div>

          {/* Key Themes & Characters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Themes */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>درون‌مایه‌ها و مفاهیم اصلی</span>
              </h4>
              <ul className="space-y-2">
                {book.keyThemes.map((theme, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl text-xs text-slate-200 border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Characters */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>شخصیت‌های کلیدی داستان</span>
              </h4>
              <ul className="space-y-2">
                {book.characters.map((char, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl text-xs text-slate-200 border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Telegram Download Box */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-100 text-sm">دانلود مستقیم فایل صوتی و PDF رایگان</h4>
                <p className="text-xs text-slate-400">عضویت در کانال ممدکتاب (t.me/mamadketab)</p>
              </div>
            </div>

            <a
              href={book.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 shrink-0"
            >
              <span>دانلود رایگان در تلگرام</span>
              <Send className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>هزینه ارسال با پست پیشتاز: ۱۰۰,۰۰۰ تومان (ثابت برای تهران و تمام استان‌ها)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              انصراف
            </button>

            <button
              onClick={() => {
                onClose();
                onOrder(book.title);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ثبت سفارش (۵۰٪ تخفیف)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

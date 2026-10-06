import React, { useState, useRef } from 'react';
import { BookItem } from '../types';
import { Headphones, Play, Pause, Download, Send, Volume2, VolumeX, BookOpen, Clock, FileText, ShoppingBag, CheckCircle2, Truck, Percent } from 'lucide-react';

interface FreeAudiobooksProps {
  books: BookItem[];
  onOrder: (bookTitle: string) => void;
  onSelectBook: (book: BookItem) => void;
}

export const FreeAudiobooks: React.FC<FreeAudiobooksProps> = ({ books, onOrder, onSelectBook }) => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBook, setActiveBook] = useState<BookItem>(books[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const audiobooksList = books.filter(b => b.audioAvailable);

  const handlePlayAudio = (book: BookItem) => {
    if (currentPlayingId === book.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentPlayingId(book.id);
      setActiveBook(book);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = book.audioSampleUrl || 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-8 my-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <span>کتاب صوتی و PDF ۱۰۰٪ رایگان در کانال تلگرام ممدکتاب</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>۵۰٪ تخفیف نسخه چاپی</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-emerald-100">
              مرجع دانلود رایگان کتاب‌های صوتی و فایل PDF
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تمامی فایل‌های صوتی استودیویی و نسخه‌های PDF کامل رمان‌ها به صورت <span className="text-emerald-400 font-extrabold underline">۱۰۰٪ رایگان</span> در کانال تلگرام ممدکتاب (<span className="text-sky-400 font-mono">t.me/mamadketab</span>) قرار دارند. نسخه‌های چاپی نیز با <span className="text-amber-300 font-bold">۵۰٪ تخفیف</span> و هزینه ارسال پستی ثابت <span className="text-emerald-300 font-bold">۱۰۰,۰۰۰ تومان</span> برای تمامی استان‌ها قابل سفارش می‌باشند.
            </p>
          </div>

          <a
            href="https://t.me/mamadketab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs shadow-xl shadow-emerald-500/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>ورود به کانال تلگرام ممدکتاب (دانلود رایگان)</span>
          </a>
        </div>
      </div>

      {/* Embedded Audio Player Banner */}
      <div className="bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Currently Playing Book Info */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-lg bg-slate-950">
              <img
                src={activeBook.paintingUrl}
                alt={activeBook.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Headphones className="w-8 h-8 text-emerald-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  صوتی و PDF رایگان
                </span>
                <span className="text-xs text-slate-400 font-mono dir-ltr flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{activeBook.audioDuration || '۰۴:۳۰:۰۰'}</span>
                </span>
              </div>

              <h3 className="text-lg font-black text-emerald-100 mt-1">
                کتاب صوتی «{activeBook.title}»
              </h3>
              <p className="text-xs text-slate-400">
                نویسنده: <span className="text-slate-200 font-bold">{activeBook.author}</span>
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-center bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handlePlayAudio(activeBook)}
              className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 shrink-0"
            >
              {isPlaying && currentPlayingId === activeBook.id ? (
                <Pause className="w-6 h-6 fill-slate-950" />
              ) : (
                <Play className="w-6 h-6 fill-slate-950 mr-0.5" />
              )}
            </button>

            <div className="flex flex-col gap-1 w-48 sm:w-64">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{isPlaying ? 'در حال پخش پیش‌نمایش...' : 'آماده پخش'}</span>
                <span>پیش‌نمایش صوتی</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className={`bg-emerald-500 h-full transition-all duration-300 ${isPlaying ? 'w-2/3 animate-pulse' : 'w-0'}`} />
              </div>
            </div>

            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-emerald-300 bg-slate-900 rounded-xl border border-slate-800"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Telegram Download Action */}
          <a
            href={activeBook.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>دانلود رایگان فایل صوتی و PDF در تلگرام</span>
          </a>

        </div>
      </div>

      {/* Audiobooks & Book List Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-emerald-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span>جدول دریافت رایگان فایل‌ها و قیمت نسخه‌های چاپی (با ۵۰٪ تخفیف)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiobooksList.map((book) => {
            const isThisPlaying = currentPlayingId === book.id && isPlaying;
            const discountedPrice = Math.round(book.physicalPrice * (1 - book.discountPercent / 100));

            return (
              <div
                key={book.id}
                className={`bg-slate-900 border rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between gap-4 ${
                  isThisPlaying
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-slate-900/90'
                    : 'border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={book.paintingUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-emerald-500/30 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-emerald-100 text-base">{book.title}</h4>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(book)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        isThisPlaying
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-emerald-300 mr-0.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {book.summaryPreview}
                  </p>

                  {/* Pricing Box */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                        <span>فایل صوتی:</span>
                      </span>
                      <span className="font-black text-emerald-400">۱۰۰٪ رایگان</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>نسخه PDF:</span>
                      </span>
                      <span className="font-black text-emerald-400">۱۰۰٪ رایگان</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300 pt-1.5 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>چاپ فیزیکی (۵۰٪ تخفیف):</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 line-through text-[10px]">
                          {book.physicalPrice.toLocaleString('fa-IR')}
                        </span>
                        <span className="font-bold text-amber-300">
                          {discountedPrice.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-sky-400" />
                        <span>پست پیشتاز:</span>
                      </span>
                      <span className="font-bold text-sky-300">۱۰۰,۰۰۰ تومان</span>
                    </div>
                  </div>

                  {book.latestPdfDate && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>لینک مستقیم تلگرام: {book.latestPdfDate}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={book.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>دانلود رایگان در تلگرام</span>
                  </a>

                  <button
                    onClick={() => onOrder(book.title)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>سفارش</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

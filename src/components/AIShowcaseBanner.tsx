import React, { useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, Star, Building2, ShoppingBag, Headphones, Percent } from 'lucide-react';
import { BookItem } from '../types';

interface AIShowcaseBannerProps {
  allBooks: BookItem[];
  onSelectBook: (book: BookItem) => void;
  onOrder: (bookTitle: string) => void;
}

export const AIShowcaseBanner: React.FC<AIShowcaseBannerProps> = ({
  allBooks,
  onSelectBook,
  onOrder
}) => {
  const [featuredSeed, setFeaturedSeed] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);

  // Get current Persian Solar Hijri date string
  const todayDateString = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // Calculate 3 AI featured books derived from seed + book array
  const getFeaturedBooks = (): BookItem[] => {
    if (!allBooks || allBooks.length === 0) return [];
    
    // Rotate books array according to featuredSeed
    const rotated = [...allBooks];
    const offset = (featuredSeed * 3) % rotated.length;
    const reordered = [...rotated.slice(offset), ...rotated.slice(0, offset)];
    return reordered.slice(0, 3);
  };

  const currentFeatured = getFeaturedBooks();

  const handleRotateShowcase = () => {
    setIsRotating(true);
    setTimeout(() => {
      setFeaturedSeed(prev => prev + 1);
      setIsRotating(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-6 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ویترین هوشمند روزانه (انتخاب AI)</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              بروزرسانی شده برای: <strong className="text-emerald-300">{todayDateString}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-emerald-100 mt-2">
            ویترین چرخشی امروز با عناوین پیشنهادی هوش مصنوعی
          </h2>
        </div>

        {/* Rotate Showcase Button */}
        <button
          onClick={handleRotateShowcase}
          disabled={isRotating}
          className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRotating ? 'animate-spin' : ''}`} />
          <span>چرخش هوشمند ویترین توسط AI</span>
        </button>
      </div>

      {/* 3 Featured Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {currentFeatured.map((book, idx) => {
          const discountedPrice = Math.round(book.physicalPrice * (1 - book.discountPercent / 100));

          return (
            <div
              key={`${book.id}-${idx}`}
              className="group bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30"
            >
              <div className="space-y-3">
                
                {/* Book Image & Badges */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={book.paintingUrl}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  <span className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black shadow-md flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>۵۰٪ تخفیف</span>
                  </span>

                  <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black shadow-md flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>صوتی/PDF رایگان</span>
                  </span>
                </div>

                {/* AI Recommendation Reason */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="line-clamp-1">{book.featuredReason || 'پیشنهاد امروز AI در ویترین چرخشی'}</span>
                </div>

                {/* Book Details */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-slate-100 text-base group-hover:text-emerald-300 transition-colors">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-0.5 text-amber-300 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{book.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-0.5">
                    نویسنده: <strong className="text-slate-100">{book.author}</strong>
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {book.summaryPreview}
                  </p>
                </div>

              </div>

              {/* Price & Order Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-500 line-through">
                    {book.physicalPrice.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-xs font-black text-amber-300">
                    {discountedPrice.toLocaleString('fa-IR')} تومان
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectBook(book)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                    title="مشاهده خلاصه"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button
                    onClick={() => onOrder(book.title)}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>سفارش</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

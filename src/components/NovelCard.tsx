import React from 'react';
import { BookItem } from '../types';
import { BookOpen, Headphones, Star, Send, ShoppingBag, Truck, Percent, Building2, Sparkles } from 'lucide-react';

interface NovelCardProps {
  book: BookItem;
  onSelect: (book: BookItem) => void;
  onOrder: (bookTitle: string) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({ book, onSelect, onOrder }) => {
  const discountedPrice = Math.round(book.physicalPrice * (1 - book.discountPercent / 100));

  return (
    <div className={`group bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${
      book.isDailyFeatured ? 'border-amber-500/60 shadow-amber-950/20 hover:border-amber-400' : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-950/20'
    }`}>
      
      {/* Cover / Image Artwork Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={book.paintingUrl}
          alt={`طرح جلد رمان ${book.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* 50% Discount Ribbon */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span className="bg-amber-500 text-slate-950 text-[11px] px-2.5 py-1 rounded-xl font-black shadow-lg flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" />
            <span>۵۰٪ تخفیف ویژه</span>
          </span>
          {book.isDailyFeatured && (
            <span className="bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-lg font-black flex items-center gap-1 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>ویترین امروز AI</span>
            </span>
          )}
        </div>

        {/* Free Audio & PDF Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-emerald-500 text-slate-950 text-[11px] px-2.5 py-1 rounded-xl font-black flex items-center gap-1 shadow-md">
            <Headphones className="w-3.5 h-3.5" />
            <span>صوتی و PDF رایگان</span>
          </span>
        </div>

        {/* Telegram Channel Indicator */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-sky-300 text-xs px-2.5 py-1 rounded-lg border border-sky-500/30 flex items-center gap-1">
          <Send className="w-3 h-3 text-sky-400" />
          <span className="font-mono text-[10px]">t.me/mamadketab</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-black text-emerald-100 group-hover:text-emerald-300 transition-colors">
              {book.title}
            </h3>
            <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>{book.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium mb-2">
            نویسنده: <span className="text-slate-100 font-bold">{book.author}</span>
            {book.translatedBy && book.translatedBy !== '-' && (
              <span className="text-slate-400 mr-2">| مترجم: {book.translatedBy}</span>
            )}
          </p>

          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
            {book.summaryPreview}
          </p>

          {/* Pricing Box */}
          <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 text-[11px] space-y-2.5">
            {/* Free Digital */}
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-300 flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>فایل صوتی و PDF:</span>
              </span>
              <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                ۱۰۰٪ رایگان در تلگرام
              </span>
            </div>

            {/* Printed Book with 50% discount */}
            <div className="flex items-center justify-between text-slate-200 pt-2 border-t border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>نسخه چاپی (۵۰٪ تخفیف):</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 line-through text-[10px]">
                  {book.physicalPrice.toLocaleString('fa-IR')}
                </span>
                <span className="font-black text-amber-300 text-xs">
                  {discountedPrice.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            {/* Postal shipping fee */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-sky-400" />
                <span>پست پیشتاز (تهران و سراسر کشور):</span>
              </span>
              <span className="font-bold text-sky-300">۱۰۰,۰۰۰ تومان</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(book)}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-200 border border-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>خلاصه و تحلیل</span>
          </button>

          <button
            onClick={() => onOrder(book.title)}
            className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>سفارش</span>
          </button>
        </div>

      </div>
    </div>
  );
};

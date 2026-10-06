import React, { useState } from 'react';
import { BookItem } from '../types';
import { ShoppingBag, Search, Tag, Truck, Check, Percent, FileText, ArrowUpDown } from 'lucide-react';

interface BookPriceListTableProps {
  books: BookItem[];
  onOrderBook: (bookTitle: string) => void;
  onSelectBook?: (book: BookItem) => void;
}

export const BookPriceListTable: React.FC<BookPriceListTableProps> = ({
  books,
  onOrderBook,
  onSelectBook
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'رمان', 'تاریخی', 'فلسفی', 'کتاب کودک'];

  const filtered = books.filter(b => {
    const matchesQuery = b.title.includes(filterQuery) || b.author.includes(filterQuery) || (b.publisher && b.publisher.includes(filterQuery));
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-6">
      
      {/* Table Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Tag className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-100">
              لیست قیمت و عناوین کتاب‌ها
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            کلیه کتاب‌های چاپی کاغذی با <span className="text-amber-300 font-black">۵۰٪ تخفیف ویژه پشت جلد</span> محاسبه شده و هزینه ارسال با پست پیشتاز <span className="text-sky-300 font-bold">۱۰۰,۰۰۰ تومان برای هر جلد کتاب کاغذی</span> برای سراسر کشور مقطوع است.
          </p>
        </div>

        {/* Quick Badge Summary */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold">تعداد عناوین فعال</span>
            <span className="text-sm font-black text-emerald-300 font-mono">{books.length} جلد</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold">ارسال پستی سراسری</span>
            <span className="text-sm font-black text-sky-300 font-mono">۱۰۰,۰۰۰ تومان</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی عنوان یا نویسنده..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'همه دسته‌ها' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Price Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
        <table className="w-full text-right text-xs text-slate-200">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">عنوان کتاب</th>
              <th className="py-3.5 px-4">نویسنده</th>
              <th className="py-3.5 px-4 text-center">دسته</th>
              <th className="py-3.5 px-4 text-center">قیمت پشت جلد</th>
              <th className="py-3.5 px-4 text-center">تخفیف</th>
              <th className="py-3.5 px-4 text-center">قیمت پرداختی ۵۰٪</th>
              <th className="py-3.5 px-4 text-center">پست پیشتاز</th>
              <th className="py-3.5 px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {filtered.map((b) => {
              const discountedPrice = Math.round(b.physicalPrice * (1 - b.discountPercent / 100));

              return (
                <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-black text-emerald-100 flex items-center gap-2.5">
                    <img
                      src={b.paintingUrl}
                      alt={b.title}
                      className="w-8 h-10 object-cover rounded-md border border-slate-800 shrink-0"
                    />
                    <div>
                      <button
                        onClick={() => onSelectBook && onSelectBook(b)}
                        className="hover:text-emerald-300 text-right transition-colors"
                      >
                        {b.title}
                      </button>
                      <span className="block text-[10px] text-slate-500 font-normal sm:hidden">
                        {b.author}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <div>{b.author}</div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-700">
                      {b.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono line-through text-slate-500">
                    {b.physicalPrice.toLocaleString('fa-IR')} تومان
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold font-mono">
                      ٪{b.discountPercent}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-black text-emerald-300 text-sm">
                    {discountedPrice.toLocaleString('fa-IR')} تومان
                  </td>

                  <td className="py-3 px-4 text-center text-[11px] text-sky-300 font-bold">
                    ۱۰۰,۰۰۰ تومان
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOrderBook(b.title)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 mx-auto shadow-md shadow-emerald-500/10"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>سفارش</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

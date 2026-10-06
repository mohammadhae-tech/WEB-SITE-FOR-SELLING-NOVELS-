import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MamadKetabBanner } from './components/MamadKetabBanner';
import { AIShowcaseBanner } from './components/AIShowcaseBanner';
import { BookPriceListTable } from './components/BookPriceListTable';
import { NovelCard } from './components/NovelCard';
import { NovelDetailModal } from './components/NovelDetailModal';
import { AISummarizerAndPainter } from './components/AISummarizerAndPainter';
import { TelegramBotView } from './components/TelegramBotView';
import { FreeAudiobooks } from './components/FreeAudiobooks';
import { OrderFormModal } from './components/OrderFormModal';
import { AdminOrdersModal } from './components/AdminOrdersModal';
import { INITIAL_NOVELS, CONTACT_PHONE, INSTAGRAM_ACC1, INSTAGRAM_ACC2, INSTAGRAM_URL_1, INSTAGRAM_URL_2 } from './data/novelsData';
import { BookItem, BookOrder, AdminNotification, OrderStatus } from './types';
import { Search, Send, Sparkles, BookOpen, ShoppingBag, Shield, Bot, Headphones, Phone, Instagram, Lock, Download } from 'lucide-react';
import { useAdminAuth } from './context/AdminAuthContext';

export default function App() {
  const { isAdmin, getAuthHeaders } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'audio' | 'ai' | 'bot' | 'admin'>('catalog');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  
  // Modal triggers
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderBookTitle, setOrderBookTitle] = useState('');
  
  // Catalog search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Orders & Notifications state
  const [orders, setOrders] = useState<BookOrder[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Live Books state with prices
  const [books, setBooks] = useState<BookItem[]>(INITIAL_NOVELS);

  // Fetch live books & prices from server
  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const booksData = await res.json();
        setBooks(booksData);
      }
    } catch (e) {
      console.error('Error fetching books:', e);
    }
  };

  // Fetch orders & notifications from API
  const fetchOrdersAndNotifications = async () => {
    try {
      const [ordersRes, notifRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/notifications')
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchOrdersAndNotifications();
  }, []);

  const handleOpenOrderModal = (title?: string) => {
    setOrderBookTitle(title || '');
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchOrdersAndNotifications();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        }
      });
      fetchOrdersAndNotifications();
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Exact Requested Categories: "عنوانها رمان، تاریخی ، فلسفی و کتاب کودک"
  const categories = [
    { id: 'all', label: 'همه دسته‌ها' },
    { id: 'رمان', label: 'رمان' },
    { id: 'تاریخی', label: 'تاریخی' },
    { id: 'فلسفی', label: 'فلسفی' },
    { id: 'کتاب کودک', label: 'کتاب کودک' }
  ];

  const filteredNovels = books.filter(book => {
    const matchesSearch =
      book.title.includes(searchQuery) ||
      book.author.includes(searchQuery) ||
      book.summaryPreview.includes(searchQuery) ||
      (book.publisher && book.publisher.includes(searchQuery));

    const matchesCategory =
      selectedCategory === 'all' || book.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-vazir selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openOrderModal={handleOpenOrderModal}
        unreadCount={unreadNotificationsCount}
        ordersCount={orders.length}
        openNotificationsModal={() => setActiveTab('admin')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* MamadKetab Channel Banner */}
        <MamadKetabBanner />

        {/* TAB 1: Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            
            {/* Daily AI Showcase Rotation Banner */}
            <AIShowcaseBanner
              allBooks={books}
              onSelectBook={(b) => setSelectedBook(b)}
              onOrder={(title) => handleOpenOrderModal(title)}
            />

            {/* Prominent Customer Price List Table */}
            <BookPriceListTable
              books={books}
              onOrderBook={(title) => handleOpenOrderModal(title)}
              onSelectBook={(b) => setSelectedBook(b)}
            />

            {/* Search & Category Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                <input
                  type="text"
                  placeholder="جستجوی عنوان کتاب، نویسنده یا ناشر ایرانی..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-11 pl-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                        : 'bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Novels Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-emerald-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>لیست کامل کتاب‌ها و ناشران ایرانی (با ۵۰٪ تخفیف)</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  نمایش {filteredNovels.length} عنوان
                </span>
              </div>

              {filteredNovels.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 space-y-3">
                  <p>هیچ رمانی مطابق با عبارت یا دسته‌بندی انتخاب شده یافت نشد.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="inline-flex items-center gap-2 text-emerald-400 hover:underline text-xs font-bold"
                  >
                    <span>مشاهده تمام کتاب‌ها</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNovels.map((book) => (
                    <NovelCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => setSelectedBook(b)}
                      onOrder={(title) => handleOpenOrderModal(title)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Free Audiobooks & PDFs from Telegram */}
        {activeTab === 'audio' && (
          <FreeAudiobooks
            books={books}
            onOrder={(title) => handleOpenOrderModal(title)}
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}

        {/* TAB 3: AI Summarizer & Painter */}
        {activeTab === 'ai' && (
          <AISummarizerAndPainter onOrder={(title) => handleOpenOrderModal(title)} />
        )}

        {/* TAB 4: Online Customer Support Bot View */}
        {activeTab === 'bot' && (
          <TelegramBotView
            onOrder={(title) => handleOpenOrderModal(title)}
            onBooksUpdated={(newBooks) => setBooks(newBooks)}
          />
        )}

        {/* TAB 5: Admin & Orders Panel */}
        {activeTab === 'admin' && (
          <AdminOrdersModal
            orders={orders}
            notifications={notifications}
            books={books}
            onRefresh={() => { fetchOrdersAndNotifications(); fetchBooks(); }}
            onUpdateStatus={handleUpdateOrderStatus}
            onMarkNotificationsRead={handleMarkNotificationsRead}
            onBooksUpdated={(newBooks) => setBooks(newBooks)}
            onBackToHome={() => setActiveTab('catalog')}
          />
        )}

      </main>

      {/* Book Details Modal */}
      {selectedBook && (
        <NovelDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onOrder={(title) => handleOpenOrderModal(title)}
        />
      )}

      {/* Book Order Form Modal */}
      {isOrderModalOpen && (
        <OrderFormModal
          initialBookTitle={orderBookTitle}
          books={books}
          onClose={() => setIsOrderModalOpen(false)}
          onOrderSuccess={() => {
            fetchOrdersAndNotifications();
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div>
            <p className="font-extrabold text-emerald-200">کانال تلگرام ممدکتاب - مرجع تخصصی کتاب‌های چاپی، صوتی و الکترونیک</p>
            <p className="text-[11px] text-slate-400 mt-1">
              توزیع سراسری کتاب با ۵۰٪ تخفیف | ارسال با پست پیشتاز: <span className="text-sky-300 font-bold">۱۰۰,۰۰۰ تومان برای هر جلد کتاب کاغذی</span> | تماس مستقیم: <span className="text-amber-300 font-mono font-bold dir-ltr">{CONTACT_PHONE}</span> | تلگرام: <a href="https://t.me/mamadketab" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline dir-ltr font-mono">t.me/mamadketab</a>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-[11px]">
              <span className="text-pink-400 font-bold flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5" />
                اینستاگرام:
              </span>
              <a href={INSTAGRAM_URL_1} target="_blank" rel="noopener noreferrer" className="text-pink-300 font-mono underline hover:text-pink-200 dir-ltr">
                @{INSTAGRAM_ACC1}
              </a>
              <span className="text-slate-600">•</span>
              <a href={INSTAGRAM_URL_2} target="_blank" rel="noopener noreferrer" className="text-purple-300 font-mono underline hover:text-purple-200 dir-ltr">
                @{INSTAGRAM_ACC2}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-xs font-bold">
            <a href={`tel:${CONTACT_PHONE}`} className="hover:text-amber-300 flex items-center gap-1.5 dir-ltr">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{CONTACT_PHONE}</span>
            </a>
            <span>•</span>
            <a href="https://t.me/mamadketab" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>کانال تلگرام</span>
            </a>
            <span>•</span>
            <a
              href="/api/download-project"
              download="mamadketab-final-project.zip"
              className="hover:text-sky-300 flex items-center gap-1 text-sky-400"
              title="دانلود کل فایل‌های پروژه (ZIP)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود فایل نهایی</span>
            </a>
            <span>•</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-amber-300 flex items-center gap-1">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isAdmin ? 'پنل مدیریت سایت' : 'ورود مدیریت سایت'}</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

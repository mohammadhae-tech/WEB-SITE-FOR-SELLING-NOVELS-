import React, { useState, useEffect } from 'react';
import { BookOrder, OrderStatus, AdminNotification, BookItem } from '../types';
import { ShieldCheck, Search, Phone, RefreshCw, Filter, CheckCircle2, Clock, Truck, XCircle, Bell, MessageSquare, Tag, FileText, Upload, Sparkles, Check, DollarSign, Lock, Key, LogOut, ShieldAlert, UserCheck, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminOrdersModalProps {
  orders: BookOrder[];
  notifications: AdminNotification[];
  books?: BookItem[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onMarkNotificationsRead: () => void;
  onBooksUpdated?: (newBooks: BookItem[]) => void;
  onBackToHome?: () => void;
}

export const AdminOrdersModal: React.FC<AdminOrdersModalProps> = ({
  orders,
  notifications,
  books = [],
  onRefresh,
  onUpdateStatus,
  onMarkNotificationsRead,
  onBooksUpdated,
  onBackToHome
}) => {
  const { isAdmin, adminUser, login, logout, getAuthHeaders } = useAdminAuth();

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'notifications' | 'prices'>('orders');

  // Manual Price Edit state
  const [editingBookPrices, setEditingBookPrices] = useState<{ [bookId: string]: { physicalPrice: number; discountPercent: number } }>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [savingBookId, setSavingBookId] = useState<string | null>(null);

  // AI PDF & Text Price List state
  const [priceListText, setPriceListText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingList, setIsProcessingList] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      onRefresh();
    }
  }, [isAdmin]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = login(usernameInput, passwordInput);
    if (!result.success) {
      setAuthError(result.error || 'نام کاربری یا رمز عبور نامعتبر است.');
    } else {
      setUsernameInput('');
      setPasswordInput('');
    }
  };

  // Initialize price edit inputs whenever books change
  useEffect(() => {
    if (books && books.length > 0) {
      const initialMap: { [bookId: string]: { physicalPrice: number; discountPercent: number } } = {};
      books.forEach(b => {
        initialMap[b.id] = {
          physicalPrice: b.physicalPrice,
          discountPercent: b.discountPercent
        };
      });
      setEditingBookPrices(initialMap);
    }
  }, [books]);

  const handleSavePriceManual = async (bookId: string) => {
    const editData = editingBookPrices[bookId];
    if (!editData) return;

    setSavingBookId(bookId);
    setSaveSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/books/${bookId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          physicalPrice: editData.physicalPrice,
          discountPercent: editData.discountPercent
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.books && onBooksUpdated) {
          onBooksUpdated(data.books);
        }
        setSaveSuccessMsg(`قیمت کتاب با موفقیت بروزرسانی شد.`);
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating price:', err);
    } finally {
      setSavingBookId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleParseAiPriceList = async () => {
    if (!priceListText.trim() && !pdfFile) {
      setAiError('لطفا متن لیست قیمت را وارد کنید یا فایل PDF آن را بارگذاری نمایید.');
      return;
    }

    setIsProcessingList(true);
    setAiReport('');
    setAiError('');

    try {
      let pdfBase64 = '';
      if (pdfFile) {
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile);
        });
      }

      const res = await fetch('/api/admin/parse-price-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          textContent: priceListText,
          pdfBase64
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiReport(data.summaryReport);
        if (data.books && onBooksUpdated) {
          onBooksUpdated(data.books);
        }
        setPriceListText('');
        setPdfFile(null);
        onRefresh();
      } else {
        setAiError(data.error || 'خطا در پردازش لیست قیمت.');
      }
    } catch (err) {
      console.error('Error in parse AI price list:', err);
      setAiError('خطا در برقراری ارتباط با سرویس پردازش هوشمند PDF.');
    } finally {
      setIsProcessingList(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.customerFirstName.includes(searchTerm) ||
      o.customerLastName.includes(searchTerm) ||
      o.phoneNumber.includes(searchTerm) ||
      o.bookTitle.includes(searchTerm) ||
      o.id.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <Clock className="w-3 h-3" />
            <span>در انتظار بررسی</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <Truck className="w-3 h-3" />
            <span>در حال پردازش / ارسال</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>تکمیل شده</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <XCircle className="w-3 h-3" />
            <span>لغو شده</span>
          </span>
        );
    }
  };

  const getFormatLabel = (fmt: string) => {
    if (fmt === 'physical') return '📖 چاپ کاغذی (۵۰٪ تخفیف - ارسال پستی ۱۰۰ هزار تومان)';
    if (fmt === 'audiobook') return '🎧 کتاب صوتی (۱۰۰٪ رایگان)';
    return '📄 فایل PDF (۱۰۰٪ رایگان)';
  };

  // If user is not authenticated as admin, show the Admin Authentication screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-10 p-7 sm:p-9 bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">
        
        {/* Back to Home Button */}
        {onBackToHome && (
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 font-bold transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180 text-emerald-400" />
              <span>بازگشت به فروشگاه و سایت اصلی</span>
            </button>
            <span className="text-[11px] text-slate-500">صفحه ورود ادمین</span>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-emerald-100">ورود مدیریت سایت ممدکتاب</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            این صفحه منحصراً برای ورود ادمین سایت جهت تغییر قیمت‌ها، اصلاح درصد تخفیف، بررسی سفارشات و صدور دستورات مدیریتی است.
          </p>
        </div>

        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              نام کاربری ادمین
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="ادمین 5"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رمز عبور ادمین
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="•••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>ورود مدیریت سایت</span>
          </button>
        </form>

        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-400 text-center space-y-1">
          <p className="text-amber-400 font-bold">مشخصات معتبر ورود مدیریت:</p>
          <p>
            نام کاربری: <span className="font-mono text-emerald-300 font-bold">ادمین 5</span> | پسورد: <span className="font-mono text-emerald-300 font-bold">ادمین 5</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 rounded-3xl text-slate-100 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-emerald-100">پنل مدیریت سایت ممدکتاب</h2>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                کاربر فعال: {adminUser || 'ادمین 5'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              بررسی و پیگیری سفارشات، اصلاح دستی قیمت‌ها و پردازش هوشمند PDF لیست قیمت
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Back to Store Button */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              title="بازگشت به ویترین و فروشگاه اصلی سایت"
            >
              <ArrowRight className="w-4 h-4 rotate-180 text-emerald-400" />
              <span>بازگشت به سایت</span>
            </button>
          )}

          {/* Download Project ZIP Button */}
          <a
            href="/api/download-project"
            download="mamadketab-final-project.zip"
            className="flex items-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/10"
            title="دانلود فایل نهایی و کامل پروژه (ZIP)"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>دانلود فایل نهایی (ZIP)</span>
          </a>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>بروزرسانی</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
            title="خروج از حساب ادمین"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج ادمین</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'orders'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>لیست سفارشات ({orders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('notifications');
            onMarkNotificationsRead();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>اعلا‌ن‌های سیستم ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'prices'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>اصلاح قیمت‌ها & خواندن PDF ({books.length} کتاب)</span>
        </button>
      </div>

      {activeSubTab === 'orders' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                placeholder="جستجو با نام، شماره تلفن یا رمان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 w-full sm:w-auto font-bold"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="processing">در حال پردازش</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

          </div>

          {/* Orders Table / Cards */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              هیچ سفارشی با این اطلاعات یافت نشد.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md font-bold">
                        {ord.id}
                      </span>
                      <h4 className="text-sm font-black text-emerald-100">
                        {ord.customerFirstName} {ord.customerLastName}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono dir-ltr flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{ord.phoneNumber}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(ord.status)}
                      <span className="text-[11px] text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block">عنوان رمان:</span>
                      <span className="font-bold text-emerald-300 text-sm">{ord.bookTitle}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">نوع درخواست:</span>
                      <span className="font-semibold">{getFormatLabel(ord.format)}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">شهر و آدرس:</span>
                      <span>{ord.city ? `${ord.city} - ` : ''}{ord.address || 'بدون آدرس'}</span>
                      {ord.postalCode && (
                        <span className="block text-[11px] text-amber-300 font-mono mt-0.5 font-bold">
                          کد پستی: {ord.postalCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {ord.notes && (
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold ml-1">یادداشت مشتری:</span>
                      <span>{ord.notes}</span>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">تغییر وضعیت:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-700 text-emerald-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none font-bold"
                      >
                        <option value="pending">در انتظار بررسی</option>
                        <option value="processing">در حال پردازش / ارسال</option>
                        <option value="completed">تکمیل شده</option>
                        <option value="cancelled">لغو سفارش</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${ord.phoneNumber}`}
                        className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>تماس تلفنی</span>
                      </a>

                      <a
                        href={`https://t.me/share/url?url=&text=${encodeURIComponent(`سلام ${ord.customerFirstName} عزیز، در خصوص سفارش رمان «${ord.bookTitle}» با شما تماس می‌گیریم.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>پیام تلگرام</span>
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      ) : activeSubTab === 'notifications' ? (
        /* Notifications View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-bold text-emerald-200 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>اعلا‌ن‌های سیستم ممدکتاب</span>
          </h3>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              هیچ اعلانی موجود نیست.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    !n.read
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(n.timestamp).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Prices Sub-Tab View */
        <div className="space-y-6">
          
          {/* Section 1: AI PDF & Text Price List Reader */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <span className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/40">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-xl font-black text-emerald-100">پردازش هوشمند لیست قیمت (PDF یا متن) با چت‌بات/هوش مصنوعی</h3>
                <p className="text-xs text-slate-300 mt-1">
                  می‌توانید فایل PDF لیست قیمت جدید ناشر را بارگذاری کنید یا متن قیمت‌ها را تایپ فرمایید. هوش مصنوعی قیمت‌ها را استخراج و در دیتابیس اعمال می‌کند.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Area Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>تایپ یا کپی لیست قیمت متنی:</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={`مثال:\nآینده یک پندار - ۱۸۰,۰۰۰ تومان - ۵۰٪ تخفیف\nبوف کور - ۲۵۰,۰۰۰ تومان - ۵۰٪ تخفیف`}
                  value={priceListText}
                  onChange={(e) => setPriceListText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* PDF File Upload Input */}
              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>آپلود فایل PDF لیست قیمت ناشر:</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center bg-slate-950/60 transition-all">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload-input"
                    />
                    <label htmlFor="pdf-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-emerald-400" />
                      <span className="text-xs text-slate-300 font-bold">
                        {pdfFile ? pdfFile.name : 'انتخاب یا رهاسازی فایل PDF / متنی لیست قیمت'}
                      </span>
                      <span className="text-[10px] text-slate-500">فرمت‌های پشتیبانی شده: PDF, TXT</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleParseAiPriceList}
                  disabled={isProcessingList}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-3"
                >
                  {isProcessingList ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>در حال خواندن سند PDF و پردازش قیمت‌ها با هوش مصنوعی...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>پردازش و اعمال هوشمند قیمت‌ها</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Report & Error Displays */}
            {aiReport && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>نتایج تغییر قیمت هوش مصنوعی:</span>
                </div>
                <p className="whitespace-pre-line text-slate-200 leading-relaxed">{aiReport}</p>
              </div>
            )}

            {aiError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* Section 2: Manual Price Modification Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>ویرایش مستقیم و دستی قیمت کتاب‌ها</span>
              </h3>
              {saveSuccessMsg && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((b) => {
                const editState = editingBookPrices[b.id] || { physicalPrice: b.physicalPrice, discountPercent: b.discountPercent };
                const calculatedFinal = Math.round(editState.physicalPrice * (1 - editState.discountPercent / 100));

                return (
                  <div key={b.id} className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl transition-all space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <img src={b.paintingUrl} alt={b.title} className="w-16 h-20 object-cover rounded-xl shrink-0 border border-slate-800" />
                      <div>
                        <h4 className="text-sm font-black text-emerald-100">{b.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{b.author} {b.publisher ? `| ${b.publisher}` : ''}</p>
                        <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                          دسته: {b.category}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1 font-bold">قیمت پشت جلد (تومان):</label>
                        <input
                          type="number"
                          value={editState.physicalPrice}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setEditingBookPrices(prev => ({
                              ...prev,
                              [b.id]: { ...prev[b.id], physicalPrice: val }
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1 font-bold">درصد تخفیف (%):</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editState.discountPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setEditingBookPrices(prev => ({
                              ...prev,
                              [b.id]: { ...prev[b.id], discountPercent: val }
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs">
                        <span className="text-slate-400 block">قیمت نهایی پرداختی:</span>
                        <span className="font-black text-emerald-300 text-sm font-mono">
                          {calculatedFinal.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>

                      <button
                        onClick={() => handleSavePriceManual(b.id)}
                        disabled={savingBookId === b.id}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {savingBookId === b.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>ذخیره قیمت</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

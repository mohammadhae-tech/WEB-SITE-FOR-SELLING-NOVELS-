import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, Phone, User, MapPin, FileText, Send, AlertCircle, RefreshCw, Truck, Percent, ShieldCheck, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { OrderFormat, PaymentMethod, BookItem } from '../types';
import { INITIAL_NOVELS } from '../data/novelsData';

interface OrderFormModalProps {
  initialBookTitle?: string;
  books?: BookItem[];
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  initialBookTitle = '',
  books = [],
  onClose,
  onOrderSuccess
}) => {
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookTitle, setBookTitle] = useState(initialBookTitle || '');
  const [format, setFormat] = useState<OrderFormat>('physical');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_gateway');

  // Bank Gateway Simulation State
  const [showGateway, setShowGateway] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expireMonth, setExpireMonth] = useState('');
  const [expireYear, setExpireYear] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderReceipt, setOrderReceipt] = useState<any>(null);

  // Dynamic exact book price calculation from live server books state
  const availableBooks = books && books.length > 0 ? books : INITIAL_NOVELS;
  const matchedBook = availableBooks.find(b => b.title.toLowerCase().includes(bookTitle.toLowerCase()) || bookTitle.toLowerCase().includes(b.title.toLowerCase()));
  const baseBookPrice = matchedBook 
    ? Math.round(matchedBook.physicalPrice * (1 - matchedBook.discountPercent / 100))
    : 160000; // Exact 50% discounted price fallback (مثلا برای دو قرن سکوت پشت جلد ۳۲۰,۰۰۰ تومان -> ۱۶۰,۰۰۰ تومان)
  const shippingFee = format === 'physical' ? 100000 : 0; // 100,000 Tomans per volume via پست پیشتاز
  const totalAmountTomans = format === 'physical' ? (baseBookPrice + shippingFee) : 0;

  const handleProceedToPaymentOrSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerFirstName.trim() || !customerLastName.trim() || !phoneNumber.trim() || !bookTitle.trim()) {
      setErrorMessage('لطفا تمام فیلدهای ضروری (نام، نام خانوادگی، شماره تلفن و عنوان کتاب) را پر کنید.');
      return;
    }

    if (phoneNumber.trim().length < 8) {
      setErrorMessage('لطفا یک شماره تلفن معتبر وارد کنید.');
      return;
    }

    setErrorMessage('');

    if (format === 'physical' && paymentMethod === 'online_gateway') {
      setShowGateway(true);
    } else {
      executeFinalOrder('telegram_support', 'unpaid', `COD-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleRequestOtp = () => {
    setIsOtpSending(true);
    setOtpMessage('');
    setTimeout(() => {
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(simulatedOtp);
      setIsOtpSending(false);
      setOtpMessage(`رمز دوم پویا به شماره ${phoneNumber} پیامک شد: ${simulatedOtp}`);
    }, 1200);
  };

  const handleCompleteGatewayPayment = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('شماره کارت ۱۶ رقمی معتبر نیست.');
      return;
    }
    if (!cvv2 || !otpCode) {
      setErrorMessage('لطفا کد CVV2 و رمز دوم پویا را وارد فرمایید.');
      return;
    }

    setErrorMessage('');
    const transactionRrn = `RRN-${Math.floor(100000000 + Math.random() * 900000000)}`;
    executeFinalOrder('online_gateway', 'paid', transactionRrn);
  };

  const executeFinalOrder = async (
    payMethod: PaymentMethod,
    payStatus: 'paid' | 'unpaid',
    txnRefId: string
  ) => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerFirstName: customerFirstName.trim(),
          customerLastName: customerLastName.trim(),
          phoneNumber: phoneNumber.trim(),
          bookTitle: bookTitle.trim(),
          format,
          city: city.trim(),
          address: address.trim(),
          postalCode: postalCode.trim(),
          notes: notes.trim(),
          paymentMethod: payMethod,
          paymentStatus: payStatus,
          transactionRefId: txnRefId,
          totalAmountTomans
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت سفارش.');
      }

      setOrderReceipt(data.order);
      setShowGateway(false);
      onOrderSuccess();
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'مشکلی در ثبت سفارش پیش آمد. لطفا دوباره تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-emerald-100">
                {showGateway ? 'درگاه پرداخت آنلاین شتاب (زرین‌پال / Shaparak)' : 'ثبت سفارش کتاب ممدکتاب'}
              </h2>
              <p className="text-xs text-slate-400">
                {showGateway ? 'پرداخت امن اینترنتی عضو شبکه شتاب کشور' : '۵۰٪ تخفیف چاپ کاغذی + ۱۰۰ هزار تومان ارسال پست پیشتاز | صوتی/PDF رایگان'}
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

        {/* Body Content */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 3: SUCCESS RECEIPT */}
          {orderReceipt ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-emerald-300">سفارش شما با موفقیت ثبت گردید!</h3>
                <p className="text-xs text-slate-300 mt-2">
                  شناسه سفارش: <span className="font-mono text-emerald-300 font-bold text-sm">{orderReceipt.id}</span>
                </p>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-right space-y-2 text-xs">
                <p><span className="text-slate-400">نام خریدار:</span> {orderReceipt.customerFirstName} {orderReceipt.customerLastName}</p>
                <p><span className="text-slate-400">شماره تماس:</span> <span className="font-mono">{orderReceipt.phoneNumber}</span></p>
                <p><span className="text-slate-400">عنوان کتاب:</span> <span className="text-emerald-300 font-bold">{orderReceipt.bookTitle}</span></p>
                <p><span className="text-slate-400">شیوه دریافت:</span> {
                  orderReceipt.format === 'physical' ? 'نسخه چاپ کاغذی (۵۰٪ تخفیف)' :
                  orderReceipt.format === 'audiobook' ? 'کتاب صوتی استودیویی (رایگان)' : 'نسخه PDF (رایگان)'
                }</p>

                {orderReceipt.paymentMethod === 'online_gateway' && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl mt-3 text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>وضعیت پرداخت: آنلاین موفق درگاه شتاب</span>
                    </p>
                    <p className="font-mono dir-ltr text-left text-[11px] text-amber-300">
                      کد پیگیری تراکنش (RRN): {orderReceipt.transactionRefId}
                    </p>
                  </div>
                )}

                {orderReceipt.format === 'physical' && (
                  <p><span className="text-slate-400">هزینه ارسال پستی:</span> <span className="text-sky-300 font-bold">۱۰۰,۰۰۰ تومان (برای هر جلد کتاب کاغذی)</span></p>
                )}
                {orderReceipt.city && <p><span className="text-slate-400">شهر:</span> {orderReceipt.city}</p>}
                {orderReceipt.address && <p><span className="text-slate-400">آدرس:</span> {orderReceipt.address}</p>}
                {orderReceipt.postalCode && <p><span className="text-slate-400">کد پستی ۱۰ رقمی:</span> <span className="font-mono text-emerald-300 font-bold">{orderReceipt.postalCode}</span></p>}
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>همکاران ممدکتاب جهت بسته‌بندی و کد رهگیری پستی با شما تماس خواهند گرفت.</span>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all"
              >
                بستن و بازگشت به سایت
              </button>
            </div>
          ) : showGateway ? (
            /* STEP 2: ONLINE BANK GATEWAY SIMULATOR */
            <div className="space-y-6">
              
              {/* Bank Gateway Banner Header */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-300 font-black">
                    شتاب
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100">درگاه پرداخت اینترنتی زرین‌پال / شاپرک</h4>
                    <p className="text-[11px] text-slate-400">پذیرنده: کانال و فروشگاه ممدکتاب</p>
                  </div>
                </div>

                <div className="text-left font-mono dir-ltr">
                  <div className="text-[10px] text-slate-400">مبلغ قابل پرداخت:</div>
                  <div className="text-sm font-black text-amber-300">
                    {totalAmountTomans.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              </div>

              {/* Card Details Form */}
              <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>شماره کارت ۱۶ رقمی شتاب</span>
                    <span className="text-[10px] text-emerald-400 font-mono">۶۰۳۷ - ۹۹۱۹ - ...</span>
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="6037 9919 1234 5678"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400 dir-ltr text-center font-bold tracking-widest"
                  />
                </div>

                {/* CVV2 & Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      کد CVV2 (پشت کارت)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="1234"
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 dir-ltr text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      تاریخ انقضا (ماه / سال)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="ماه"
                        value={expireMonth}
                        onChange={(e) => setExpireMonth(e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2.5 text-sm font-mono text-slate-100 text-center focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="سال"
                        value={expireYear}
                        onChange={(e) => setExpireYear(e.target.value)}
                        className="w-1/2 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2.5 text-sm font-mono text-slate-100 text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* OTP Dynamic Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رمز دوم پویا اینترنتی
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="کد ۶ رقمی پیامک شده"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 dir-ltr text-center font-extrabold tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isOtpSending}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                      {isOtpSending ? 'در حال دریافت...' : 'درخواست رمز پویا'}
                    </button>
                  </div>
                  {otpMessage && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1.5">{otpMessage}</p>
                  )}
                </div>

              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Gateway Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGateway(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>بازگشت به اطلاعات سفارش</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteGatewayPayment}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال پرداخت و نهایی‌سازی...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>پرداخت امن و ثبت تراکنش</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* STEP 1: ORDER INPUT FORM */
            <form onSubmit={handleProceedToPaymentOrSubmit} className="space-y-5">
              
              {/* Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>نام <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: علی"
                    value={customerFirstName}
                    onChange={(e) => setCustomerFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>نام خانوادگی <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: رضایی"
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Phone Number & Book Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>شماره تلفن / همراه <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 dir-ltr text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>عنوان کتاب / رمان <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="عنوان رمان درخواستی"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Delivery Format Selection */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-2">
                  نوع سفارش و شیوه دریافت
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('physical')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      format === 'physical'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    📖 چاپ کاغذی (۵۰٪ تخفیف)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('audiobook')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      format === 'audiobook'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    🎧 فایل صوتی (۱۰۰٪ رایگان)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      format === 'pdf'
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    📄 فایل PDF (۱۰۰٪ رایگان)
                  </button>
                </div>
              </div>

              {/* Payment Method Selection for Physical Books */}
              {format === 'physical' && (
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
                  <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>انتخاب شیوه پرداخت</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online_gateway')}
                      className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                        paymentMethod === 'online_gateway'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-extrabold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div>💳 درگاه پرداخت آنلاین شتاب</div>
                        <div className="text-[10px] text-slate-400 font-normal">پرداخت فوری با رمز دوم پویا</div>
                      </div>
                      {paymentMethod === 'online_gateway' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('telegram_support')}
                      className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                        paymentMethod === 'telegram_support'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-extrabold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div>📞 ثبت سفارش و پرداخت پس از تماس</div>
                        <div className="text-[10px] text-slate-400 font-normal">هماهنگی تلفنی با 09902011726</div>
                      </div>
                      {paymentMethod === 'telegram_support' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              )}

              {/* City, Address & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>شهر</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: تهران، شیراز..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>کد پستی ۱۰ رقمی</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>آدرس پستی دقیق</span>
                  </label>
                  <input
                    type="text"
                    placeholder="خیابان، پلاک، واحد..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>توضیحات یا آیدی تلگرام</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="در صورت لزوم آیدی تلگرام یا نکات تحویل را بنویسید..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit / Proceed */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {format === 'physical' && paymentMethod === 'online_gateway' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>انتقال به درگاه آنلاین شتاب</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تایید و ثبت نهایی سفارش</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_NOVELS } from './src/data/novelsData';

dotenv.config();

// In-memory store for books & live prices
let booksStore = INITIAL_NOVELS.map(b => ({ ...b }));

interface OrderRecord {
  id: string;
  customerFirstName: string;
  customerLastName: string;
  phoneNumber: string;
  bookId?: string;
  bookTitle: string;
  format: 'physical' | 'audiobook' | 'pdf';
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: 'online_gateway' | 'cash_on_delivery' | 'telegram_support';
  paymentStatus?: 'paid' | 'unpaid' | 'failed';
  transactionRefId?: string;
  totalAmountTomans?: number;
  createdAt: string;
  isNotified: boolean;
}

interface NotificationRecord {
  id: string;
  message: string;
  timestamp: string;
  type: 'order' | 'system';
  read: boolean;
  orderId?: string;
}

// In-memory data persistence for orders & notifications
const ordersStore: OrderRecord[] = [
  {
    id: 'ORD-1001',
    customerFirstName: 'علی',
    customerLastName: 'رضایی',
    phoneNumber: '09123456789',
    bookTitle: 'بوف کور',
    format: 'physical',
    city: 'تهران',
    address: 'خیابان انقلاب، خیابان ۱۵ خرداد، پلاک ۴۲',
    notes: 'لطفا در صورت امکان بسته با پست پیشتاز ارسال شود.',
    status: 'pending',
    paymentMethod: 'online_gateway',
    paymentStatus: 'paid',
    transactionRefId: 'RRN-982144721',
    totalAmountTomans: 245000,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isNotified: true
  },
  {
    id: 'ORD-1002',
    customerFirstName: 'مریم',
    customerLastName: 'حسینی',
    phoneNumber: '09351112233',
    bookTitle: 'شازده کوچولو',
    format: 'audiobook',
    city: 'اصفهان',
    address: 'خیابان چهارباغ عباسی، مجتمع کوثر، واحد ۱۲',
    notes: 'ارسال لینک فایل صوتی کیفیت بالا به تلگرام',
    status: 'processing',
    paymentMethod: 'telegram_support',
    paymentStatus: 'paid',
    transactionRefId: 'FREE-TELEGRAM',
    totalAmountTomans: 0,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isNotified: true
  }
];

const notificationsStore: NotificationRecord[] = [
  {
    id: 'NOTIF-1',
    message: 'خوش آمدید! کانال ممدکتاب همراه با ۵۰٪ تخفیف چاپ، فایل صوتی و PDF رایگان آماده دریافت سفارشات شماست.',
    timestamp: new Date().toISOString(),
    type: 'system',
    read: false
  },
  {
    id: 'NOTIF-2',
    message: 'سفارش جدید (بوف کور) از مشتری: علی رضایی - شماره: 09123456789 - پرداخت شده درگاه آنلاین',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'order',
    read: false,
    orderId: 'ORD-1001'
  }
];

// Helper: Get Gemini Client with Server API key
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Admin Auth Verification (User: ادمین 5, Pass: ادمین 5)
function normalizeAuthString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\s+/g, ' ');
}

function isValidAdminCredentials(user?: string, pass?: string): boolean {
  if (!user || !pass) return false;
  const normUser = normalizeAuthString(user);
  const normPass = normalizeAuthString(pass);

  const allowedUserVariants = ['ادمین 5', 'ادمین5', 'admin 5', 'admin5'];
  const allowedPassVariants = ['ادمین 5', 'ادمین5', 'admin 5', 'admin5'];

  return allowedUserVariants.includes(normUser) && allowedPassVariants.includes(normPass);
}

function safeDecodeHeader(val?: string): string {
  if (!val) return '';
  try {
    if (val.includes('%')) {
      return decodeURIComponent(val);
    }
  } catch {}
  try {
    const latin1Decoded = Buffer.from(val, 'latin1').toString('utf8');
    if (latin1Decoded && (latin1Decoded.includes('ادمین') || latin1Decoded.includes('admin'))) {
      return latin1Decoded;
    }
  } catch {}
  return val;
}

function checkAdminAuth(req: express.Request): boolean {
  const rawUser = (req.headers['x-admin-username'] as string) || (req.body?.adminUsername as string);
  const rawPass = (req.headers['x-admin-password'] as string) || (req.body?.adminPassword as string);
  const user = safeDecodeHeader(rawUser);
  const pass = safeDecodeHeader(rawPass);
  return isValidAdminCredentials(user, pass);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route 1: Summarize & Analyze Book
  app.post('/api/summarize-novel', async (req, res) => {
    try {
      const { title, author, excerpt } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'عنوان کتاب الزامی است.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          title,
          author: author || 'نویسنده نامشخص',
          summary: `کتاب «${title}» از آثار برجسته است که در کانال ممدکتاب معرفی شده است. فایل‌های صوتی و PDF آن ۱۰۰٪ رایگان در تلگرام t.me/mamadketab قابل دریافت است و نسخه چاپی با ۵۰٪ تخفیف ارائه می‌گردد.`,
          plotOverview: 'پیرنگ این اثر به کاوش در لایه‌های عمیق انسانی، اخلاقی و اجتماعی می‌پردازد.',
          characterAnalysis: ['شخصیت اصلی (جویای حقیقت)', 'شخصیت مکمل (راهنما)'],
          keyTakeaways: ['خردورزی و خودآگاهی', 'جستجوی معنا در زندگی', 'نقش کتاب در تعالی انسان'],
          paintingPrompt: `A magnificent artistic book cover illustration for ${title} novel in Persian literary fine art style`,
          paintingUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
          suggestedTelegramLink: 'https://t.me/mamadketab'
        });
      }

      const prompt = `شما کارشناس ادبیات کانال ممدکتاب هستید.
لطفا کتاب یا رمان فارسی/جهانی با عنوان "${title}" ${author ? `اثر "${author}"` : ''} را به‌طور کامل، جذاب و ساختاریافته تحلیل و خلاصه‌نویسی فرمایید.
${excerpt ? `متن یا خلاصه ارائه شده توسط کاربر: "${excerpt}"` : ''}

پاسخ را دقیقا به صورت JSON با ساختار زیر برگردانید:
{
  "title": "عنوان کامل کتاب",
  "author": "نام نویسنده",
  "summary": "چکیده صمیمی و جذاب درباره کتاب (۳-۴ جمله)",
  "plotOverview": "شرح پیرنگ و ماجرای اصلی داستان",
  "characterAnalysis": ["تحلیل شخصیت ۱", "تحلیل شخصیت ۲"],
  "keyTakeaways": ["پیام و آموزه اصلی ۱", "پیام و آموزه اصلی ۲", "پیام ۳"],
  "paintingPrompt": "توصیف کوتاه به زبان انگلیسی برای خلق تصویر هنری جلد کتاب"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          ...parsed,
          paintingUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
          suggestedTelegramLink: 'https://t.me/mamadketab'
        });
      }

      throw new Error('Gemini returned empty text');
    } catch (err: any) {
      console.error('Error in summarize route:', err);
      return res.status(500).json({ error: 'خطا در خلاصه‌سازی هوشمند کتاب.' });
    }
  });

  // API Route 2: Generate Cover Artwork Illustration
  app.post('/api/generate-painting', async (req, res) => {
    try {
      const { prompt, title } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          paintingUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
          isFallback: true
        });
      }

      const imagenPrompt = `An exquisite award-winning book jacket cover artwork for ${title || 'Persian Literature Book'}, ${prompt || 'vintage artistic style with golden Persian typography accents'}, masterwork digital oil painting, 8k resolution`;

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagenPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3'
        }
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return res.json({ paintingUrl: imageUrl, isFallback: false });
      } else {
        return res.json({
          paintingUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
          isFallback: true
        });
      }
    } catch (err: any) {
      console.error('Error in generate painting:', err);
      return res.json({
        paintingUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
        isFallback: true,
        message: 'تصویر پیش‌فرض جایگزین گردید.'
      });
    }
  });

  // API Route 3: Register Customer Book Order with Payment Support
  app.post('/api/orders', (req, res) => {
    try {
      const {
        customerFirstName,
        customerLastName,
        phoneNumber,
        bookId,
        bookTitle,
        format,
        city,
        address,
        postalCode,
        notes,
        paymentMethod,
        paymentStatus,
        transactionRefId,
        totalAmountTomans
      } = req.body;

      if (!customerFirstName || !customerLastName || !phoneNumber || !bookTitle) {
        return res.status(400).json({ error: 'نام، نام خانوادگی، شماره تلفن و عنوان کتاب الزامی می‌باشند.' });
      }

      const newOrder: OrderRecord = {
        id: `ORD-${Date.now().toString().slice(-5)}`,
        customerFirstName: customerFirstName.trim(),
        customerLastName: customerLastName.trim(),
        phoneNumber: phoneNumber.trim(),
        bookId: bookId || undefined,
        bookTitle: bookTitle.trim(),
        format: format || 'physical',
        city: (city || 'نامشخص').trim(),
        address: (address || 'ثبت نشده').trim(),
        postalCode: (postalCode || '').trim(),
        notes: (notes || '').trim(),
        status: 'pending',
        paymentMethod: paymentMethod || 'telegram_support',
        paymentStatus: paymentStatus || (paymentMethod === 'online_gateway' ? 'paid' : 'unpaid'),
        transactionRefId: transactionRefId || `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        totalAmountTomans: totalAmountTomans || 0,
        createdAt: new Date().toISOString(),
        isNotified: false
      };

      ordersStore.unshift(newOrder);

      // Create Admin Notification
      const notif: NotificationRecord = {
        id: `NOTIF-${Date.now()}`,
        message: `سفارش جدید (${newOrder.bookTitle}) از مشتری: ${newOrder.customerFirstName} ${newOrder.customerLastName} | پرداخت: ${newOrder.paymentStatus === 'paid' ? 'آنلاین موفق' : 'هماهنگی تلفنی'}`,
        timestamp: new Date().toISOString(),
        type: 'order',
        read: false,
        orderId: newOrder.id
      };

      notificationsStore.unshift(notif);

      return res.status(201).json({
        success: true,
        message: 'سفارش کتاب با موفقیت ثبت شد و به مدیریت اطلاع داده شد.',
        order: newOrder
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'خطا در ثبت سفارش.' });
    }
  });

  // API Route 4: Get All Orders (Admin)
  app.get('/api/orders', (req, res) => {
    return res.json(ordersStore);
  });

  // API Route 5: Update Order Status
  app.patch('/api/orders/:id/status', (req, res) => {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز: تغییر وضعیت سفارش فقط برای ادمین (ادمین 5) مجاز است.' });
    }
    const { id } = req.params;
    const { status } = req.body;

    const order = ordersStore.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'سفارش یافت نشد.' });
    }

    if (['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      order.status = status;
      return res.json({ success: true, order });
    }

    return res.status(400).json({ error: 'وضعیت معتبر نیست.' });
  });

  // API Route 6: Notifications List
  app.get('/api/notifications', (req, res) => {
    return res.json(notificationsStore);
  });

  // API Route 7: Mark Notifications as Read
  app.post('/api/notifications/mark-read', (req, res) => {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز.' });
    }
    notificationsStore.forEach(n => { n.read = true; });
    return res.json({ success: true });
  });

  // API Route 8: Get Live Books List
  app.get('/api/books', (req, res) => {
    return res.json(booksStore);
  });

  // API Route 9: Update Individual Book Price
  app.patch('/api/admin/books/:id/price', (req, res) => {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز: تغییر قیمت و تخفیف منحصراً در اختیار ادمین با نام کاربری و رمز «ادمین 5» می‌باشد.' });
    }
    const { id } = req.params;
    const { physicalPrice, discountPercent } = req.body;

    const book = booksStore.find(b => b.id === id);
    if (!book) {
      return res.status(404).json({ error: 'کتاب یافت نشد.' });
    }

    if (typeof physicalPrice === 'number' && physicalPrice >= 0) {
      book.physicalPrice = physicalPrice;
    }
    if (typeof discountPercent === 'number' && discountPercent >= 0 && discountPercent <= 100) {
      book.discountPercent = discountPercent;
    }

    const calcDiscounted = Math.round(book.physicalPrice * (1 - book.discountPercent / 100));

    notificationsStore.unshift({
      id: `NOTIF-${Date.now()}`,
      message: `اصلاح دستی قیمت کتاب «${book.title}»: قیمت جدید پشت جلد ${book.physicalPrice.toLocaleString('fa-IR')} تومان (با ${book.discountPercent}٪ تخفیف: ${calcDiscounted.toLocaleString('fa-IR')} تومان).`,
      timestamp: new Date().toISOString(),
      type: 'system',
      read: false
    });

    return res.json({ success: true, book, books: booksStore });
  });

  // API Route 10: AI PDF / Text Price List Reader & Batch Price Updating
  app.post('/api/admin/parse-price-list', async (req, res) => {
    if (!checkAdminAuth(req)) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز: بارگذاری لیست قیمت و تغییر قیمت‌ها منحصراً در اختیار ادمین «ادمین 5» می‌باشد.' });
    }
    try {
      const { textContent, pdfBase64 } = req.body;
      if (!textContent && !pdfBase64) {
        return res.status(400).json({ error: 'لطفا متن لیست قیمت یا فایل PDF را ارسال نمایید.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({ error: 'سرویس هوش مصنوعی خوانی فعال نیست.' });
      }

      const existingBooksSummary = booksStore.map(b => ({
        id: b.id,
        title: b.title,
        currentPhysicalPrice: b.physicalPrice,
        currentDiscount: b.discountPercent
      }));

      const systemPrompt = `شما سیستم هوشمند پردازش لیست قیمت کتاب‌های ممدکتاب هستید.
لیست کتاب‌های ثبت‌شده فعلی در اپلیکیشن:
${JSON.stringify(existingBooksSummary, null, 2)}

وظیفه شما:
۱. متن یا سند PDF پیوست شده را تحلیل کنید.
۲. عناوین کتاب‌هایی که در سند یا متن ذکر شده‌اند را با لیست کتاب‌های بالا مطابقت دهید.
۳. قیمت جدید پشت جلد (تومان) و درصد تخفیف جدید (در صورت وجود) را استخراج کنید.
۴. خروجی را دقیقاً به فرمت JSON زیر تولید کنید:
{
  "updatedBooks": [
    {
      "bookId": "شناسه کتاب مطابقت یافته (مثلا book-1)",
      "bookTitle": "عنوان دقیق کتاب",
      "newPhysicalPrice": 200000,
      "newDiscountPercent": 50,
      "notes": "توضیح کوتاه تغییر قیمت"
    }
  ],
  "summaryReport": "گزارش کامل و شکیل فارسی شامل عناوین تغییر یافته، قیمت قدیم و جدید"
}`;

      let contents: any[] = [];
      if (pdfBase64) {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        contents = [
          systemPrompt,
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64
            }
          }
        ];
      } else {
        contents = [`${systemPrompt}\n\nمتن لیست قیمت پردازشی:\n"${textContent}"`];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const updatedList: any[] = [];

        if (Array.isArray(parsed.updatedBooks)) {
          parsed.updatedBooks.forEach((item: any) => {
            const book = booksStore.find(
              b => b.id === item.bookId ||
                   b.title.toLowerCase().includes(item.bookTitle?.toLowerCase()) ||
                   item.bookTitle?.toLowerCase().includes(b.title.toLowerCase())
            );
            if (book) {
              if (typeof item.newPhysicalPrice === 'number' && item.newPhysicalPrice > 0) {
                book.physicalPrice = item.newPhysicalPrice;
              }
              if (typeof item.newDiscountPercent === 'number' && item.newDiscountPercent >= 0) {
                book.discountPercent = item.newDiscountPercent;
              }
              updatedList.push({
                id: book.id,
                title: book.title,
                newPrice: book.physicalPrice,
                discountPercent: book.discountPercent
              });
            }
          });
        }

        if (updatedList.length > 0) {
          notificationsStore.unshift({
            id: `NOTIF-${Date.now()}`,
            message: `بروزرسانی هوشمند قیمت ${updatedList.length} کتاب از طریق خواندن لیست PDF/متنی توسط هوش مصنوعی.`,
            timestamp: new Date().toISOString(),
            type: 'system',
            read: false
          });
        }

        return res.json({
          success: true,
          updatedCount: updatedList.length,
          summaryReport: parsed.summaryReport || `تعداد ${updatedList.length} قیمت با موفقیت بروزرسانی شد.`,
          books: booksStore
        });
      }

      throw new Error('پاسخ هوش مصنوعی خالی بود.');
    } catch (err: any) {
      console.error('Error in parse price list:', err);
      return res.status(500).json({ error: 'خطا در پردازش لیست قیمت. لطفا متن یا فایل PDF را بررسی فرمایید.' });
    }
  });

  // API Route 11: Online Customer Support Bot Chat with AI Price List Reading
  app.post('/api/bot-support', async (req, res) => {
    try {
      const { message, pdfBase64 } = req.body;
      const isAdmin = checkAdminAuth(req);

      if (!message && !pdfBase64) {
        return res.status(400).json({ error: 'پیام کاربر یا فایل PDF الزامی است.' });
      }

      const q = (message || '').toLowerCase();

      // Guard: Non-admin users cannot command the bot or alter prices/discounts
      if (!isAdmin) {
        if (pdfBase64) {
          return res.json({
            reply: '⛔ **دسترسی محدود است:**\nامکان بارگذاری فایل PDF لیست قیمت، اصلاح تخفیف‌ها و تغییر آنلاین قیمت‌ها منحصراً در اختیار ادمین سایت (با نام کاربری و رمز **ادمین 5**) می‌باشد.\n\nبه عنوان مشتری گرامی، می‌توانید از فایل‌های صوتی و PDF رایگان در تلگرام استفاده نموده یا کتاب‌های چاپی را با ۵۰٪ تخفیف سفارش دهید.',
            books: booksStore
          });
        }

        const isCommandOrPriceChange =
          (q.includes('قیمت') && (q.includes('کن') || q.includes('بکن') || q.includes('بذار') || q.includes('بزار') || q.includes('قرار') || q.includes('تغییر') || q.includes('اصلاح') || q.includes('عوض') || q.includes('تنظیم') || q.includes('دستور'))) ||
          q.includes('دستور') ||
          (q.includes('تخفیف') && (q.includes('کن') || q.includes('بکن') || q.includes('بذار') || q.includes('بزار') || q.includes('تغییر') || q.includes('اصلاح') || q.includes('عوض'))) ||
          (q.includes('لیست قیمت') && (q.includes('اپدیت') || q.includes('تغییر') || q.includes('اصلاح') || q.includes('اعمال') || q.includes('ثبت')));

        if (isCommandOrPriceChange) {
          return res.json({
            reply: '⛔ **دسترسی محدود است:**\nتغییر قیمت، اصلاح درصد تخفیف و صدور دستورات ویرایش منحصراً در اختیار **ادمین (با نام کاربری و پسورد: ادمین 5)** می‌باشد.\n\nشما به عنوان کاربر می‌توانید از کتاب‌ها استعلام بگیرید، درباره کتاب‌ها سوال بپرسید یا جهت خرید با ۵۰٪ تخفیف اقدام فرمایید.',
            books: booksStore
          });
        }
      }

      const ai = getGeminiClient();

      if (ai) {
        try {
          const currentBooksContext = booksStore.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            coverPrice: b.physicalPrice,
            discount: b.discountPercent,
            finalPrice: Math.round(b.physicalPrice * (1 - b.discountPercent / 100))
          }));

          const systemInstruction = isAdmin
            ? `شما ربات هوشمند ممدکتاب در پنل مدیریت هستید.
کاربر احراز هویت شده و ادمین سامانه (با دسترسی ادمین 5) است.
شما مجاز هستید به دستورات ادمین برای تغییر قیمت، اصلاح تخفیف، و خواندن فایل‌های PDF لیست قیمت عمل کنید.

لیست کتاب‌های موجود و قیمت‌های فعلی اپلیکیشن:
${JSON.stringify(currentBooksContext, null, 2)}

اطلاعات کلیدی ممدکتاب:
- شماره تلفن پشتیبانی: 09902011726
- تلگرام: t.me/mamadketab
- پیج‌های اینستاگرام: @mamadketab1 و @mamadadketab2
- هزینه ارسال پست پیشتاز: ۱۰۰,۰۰۰ تومان (برای هر جلد کتاب کاغذی)

دستورالعمل قیمت‌گذاری ادمین:
اگر ادمین دستور تغییر قیمت، درصد تخفیف، یا فایل PDF فرستاد:
۱. تغییرات اعمال شده را در پاسخ قید کنید.
۲. یک بلاک JSON در انتهای پاسخ با کلید "PRICE_UPDATES" قرار دهید تا دیتابیس بروزرسانی شود:
[[PRICE_UPDATES: [{"bookTitle":"عنوان کتاب", "newPhysicalPrice":200000, "newDiscountPercent":50}]]]`
            : `شما ربات پشتیبان و پاسخگوی مشتریان ممدکتاب هستید.
کاربر یک کاربر عادی است و ادمین نیست.
شما به هیچ عنوان به دستورات تغییر قیمت، تخفیف، یا تغییر در دیتابیس پاسخ مثبت نمی‌دهید. اگر کاربر تقاضای تغییر قیمت یا تخفیف کرد، حتماً بیان کنید که صدور دستورات و تغییر قیمت‌ها منحصراً در اختیار ادمین با نام کاربری و رمز «ادمین 5» است.
وظیفه شما فقط راهنمایی درباره کتاب‌ها، شرایط ارسال پست پیشتاز (۱۰۰,۰۰۰ تومان برای هر جلد کتاب کاغذی)، ۵۰٪ تخفیف نسخه چاپی، و دانلود ۱۰۰٪ رایگان فایل‌های صوتی و PDF در کانال تلگرام t.me/mamadketab می‌باشد.
به هیچ وجه بلاک PRICE_UPDATES تولید نکنید.`;

          let contents: any[] = [];
          if (pdfBase64 && isAdmin) {
            const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
            contents = [
              systemInstruction,
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: cleanBase64
                }
              },
              `لطفا فایل PDF لیست قیمت را بخوانید و قیمت کتاب‌های مطابقت‌یافته را اصلاح فرمایید.`
            ];
          } else {
            contents = [`${systemInstruction}\n\nپیام کاربر: "${message}"`];
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents
          });

          if (response.text) {
            let replyText = response.text;

            // Only execute PRICE_UPDATES if the user is authenticated ADMIN
            if (isAdmin) {
              const updateMatch = replyText.match(/\[\[PRICE_UPDATES:\s*(\[.*?\])\s*\]\]/s);
              if (updateMatch && updateMatch[1]) {
                try {
                  const priceUpdates = JSON.parse(updateMatch[1]);
                  let updatedNames: string[] = [];
                  priceUpdates.forEach((up: any) => {
                    const book = booksStore.find(
                      b => b.title.toLowerCase().includes(up.bookTitle?.toLowerCase()) ||
                           up.bookTitle?.toLowerCase().includes(b.title.toLowerCase())
                    );
                    if (book) {
                      if (typeof up.newPhysicalPrice === 'number' && up.newPhysicalPrice > 0) {
                        book.physicalPrice = up.newPhysicalPrice;
                      }
                      if (typeof up.newDiscountPercent === 'number' && up.newDiscountPercent >= 0) {
                        book.discountPercent = up.newDiscountPercent;
                      }
                      updatedNames.push(book.title);
                    }
                  });

                  replyText = replyText.replace(/\[\[PRICE_UPDATES:\s*\[.*?\]\s*\]\]/s, '').trim();

                  if (updatedNames.length > 0) {
                    replyText += `\n\n✅ **دیتابیس توسط ادمین بروزرسانی شد:** قیمت ${updatedNames.join('، ')} در تمام بخش‌های سایت اصلاح گردید.`;
                  }
                } catch (e) {
                  console.error('Error parsing price update json from bot:', e);
                }
              }
            } else {
              // Strip any rogue PRICE_UPDATES block for non-admin
              replyText = replyText.replace(/\[\[PRICE_UPDATES:\s*\[.*?\]\s*\]\]/s, '').trim();
            }

            return res.json({ reply: replyText, books: booksStore });
          }
        } catch (e) {
          console.error('Gemini bot support error, fallback:', e);
        }
      }

      // Fallback response
      let reply = '';
      if (q.includes('قیمت') || q.includes('اصلاح') || q.includes('دستور')) {
        if (isAdmin) {
          reply = '✅ ادمین گرامی: شما می‌توانید قیمت کتاب‌ها را به صورت دستی در پنل مدیریت یا با ارسال دستور در این چت اصلاح فرمایید.';
        } else {
          reply = '⛔ دسترسی محدود است: تغییر قیمت، اصلاح تخفیف و دستور دادن به چت‌بات منحصراً در اختیار ادمین با نام کاربری و رمز «ادمین 5» می‌باشد. برای استعلام یا سفارش می‌توانید از منوی ربات استفاده نمایید.';
        }
      } else if (q.includes('تلفن') || q.includes('شماره') || q.includes('تماس')) {
        reply = '📱 شماره تلفن مستقیم پشتیبانی ممدکتاب: 09902011726 می‌باشد.';
      } else {
        reply = 'سلام! برای دانلود رایگان صوتی/PDF و خرید رمان‌های چاپی با ۵۰٪ تخفیف ویژه و ارسال پست پیشتاز (۱۰۰ هزار تومان برای هر جلد) در خدمت شما هستیم. کانال تلگرام: t.me/mamadketab';
      }

      return res.json({ reply, books: booksStore });
    } catch (err: any) {
      console.error('Error in bot-support route:', err);
      return res.status(500).json({ error: 'خطا در ارتباط با ربات پشتیبان.' });
    }
  });

  // API Route 12: Download Final Complete Project Archive (ZIP)
  app.get('/api/download-project', (req, res) => {
    try {
      const zipPath = path.join(process.cwd(), 'mamadketab-project-final.zip');
      const pyScript = `
import zipfile, os
zip_path = 'mamadketab-project-final.zip'
exclude_dirs = {'node_modules', '.git', 'dist', '.cache'}
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f == zip_path or f.endswith('.zip'):
                continue
            full_path = os.path.join(root, f)
            arcname = os.path.relpath(full_path, '.')
            zipf.write(full_path, arcname)
`;
      execSync(`python3 -c "${pyScript.replace(/"/g, '\\"')}"`, { cwd: process.cwd() });
      if (!fs.existsSync(zipPath)) {
        return res.status(500).json({ error: 'فایل زیپ نهایی یافت نشد.' });
      }
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="mamadketab-final-project.zip"');
      return res.sendFile(zipPath);
    } catch (err: any) {
      console.error('Error packaging project zip:', err);
      return res.status(500).json({ error: 'خطا در آماده‌سازی فایل نهایی پروژه.' });
    }
  });

  // Vite middleware / static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

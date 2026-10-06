export interface BookItem {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  publisher?: string; // Iranian publisher (e.g., نشر چشمه، نشر نی، امیرکبیر، آگاه)
  category: string;
  summaryPreview: string;
  fullSummary: string;
  keyThemes: string[];
  characters: string[];
  paintingPrompt: string;
  paintingUrl: string;
  telegramLink: string;
  audioAvailable: boolean;
  pagesCount: number;
  rating: number;
  publicationYear?: string;
  translatedBy?: string;
  isDailyFeatured?: boolean; // Highlighted by AI Daily Showcase
  featuredReason?: string; // AI recommendation text
  // Pricing & Free Digital Books
  pdfPrice: 0; // 100% Free on MamadKetab Telegram
  audioPrice: 0; // 100% Free on MamadKetab Telegram
  physicalPrice: number; // Original printed book price
  discountPercent: number; // 50% Special Discount
  shippingFee: number; // Flat 100,000 Tomans postal fee (Tehran & all provinces)
  audioSampleUrl?: string; // audio track URL for browser playback
  audioDuration?: string; // e.g. "04:30:00"
  pdfSize?: string; // e.g. "12.5 MB"
  latestPdfDate?: string; // e.g. "1403/05/20"
}

export type OrderFormat = 'physical' | 'audiobook' | 'pdf';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentMethod = 'online_gateway' | 'cash_on_delivery' | 'telegram_support';
export type PaymentStatus = 'paid' | 'unpaid' | 'failed';

export interface BookOrder {
  id: string;
  customerFirstName: string;
  customerLastName: string;
  phoneNumber: string;
  bookId?: string;
  bookTitle: string;
  format: OrderFormat;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  transactionRefId?: string;
  totalAmountTomans?: number;
  createdAt: string;
  isNotified: boolean;
}

export interface AdminNotification {
  id: string;
  message: string;
  timestamp: string;
  type: 'order' | 'system';
  read: boolean;
  orderId?: string;
}

export interface NovelSummaryRequest {
  title: string;
  author?: string;
  excerpt?: string;
}

export interface NovelSummaryResponse {
  title: string;
  author: string;
  summary: string;
  plotOverview: string;
  characterAnalysis: string[];
  keyTakeaways: string[];
  paintingPrompt: string;
  paintingUrl?: string;
  suggestedTelegramLink?: string;
}

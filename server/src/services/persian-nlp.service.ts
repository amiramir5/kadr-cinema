import { StructuredInterpretation } from '../types';

interface PersianGenreMapping {
  genreId: number;
  nameEn: string;
  nameFa: string;
  keywords: string[];
}

const GENRE_RULES: PersianGenreMapping[] = [
  {
    genreId: 9648,
    nameEn: 'Mystery',
    nameFa: 'معمایی',
    keywords: ['معمایی', 'رازآلود', 'راز', 'گره‌گشایی', 'پیچیده', 'پازل', 'ابهام', 'قاتل رو حدس بزنم', 'حل معما', 'مبهم']
  },
  {
    genreId: 80,
    nameEn: 'Crime',
    nameFa: 'جنایی',
    keywords: ['جنایی', 'پلیسی', 'کارآگاه', 'کارآگاهی', 'قتل', 'قاتل', 'تبهکار', 'مافیا', 'سرقت', 'دزدی', 'پرونده جنایی', 'گانگستری']
  },
  {
    genreId: 35,
    nameEn: 'Comedy',
    nameFa: 'کمدی',
    keywords: ['کمدی', 'طنز', 'خنده‌دار', 'بامزه', 'خنده دار', 'شاد', 'مفرح', 'حال‌خوب‌کن', 'خوش‌خلق', 'سیتکام']
  },
  {
    genreId: 27,
    nameEn: 'Horror',
    nameFa: 'ترسناک',
    keywords: ['ترسناک', 'وحشت', 'دلهره', 'جن', 'روح', 'تسخیر', 'ترس', 'اسلشر', 'وحشتناک', 'هولناک']
  },
  {
    genreId: 878,
    nameEn: 'Science Fiction',
    nameFa: 'علمی‌تخیلی',
    keywords: ['علمی تخیلی', 'علمی‌تخیلی', 'فضا', 'فضایی', 'کرم‌چاله', 'سفر در زمان', 'هوش مصنوعی', 'ربات', 'آینده‌نگرانه', 'سیاره', 'کیهانی', 'سایبرپانک', 'سای‌فای']
  },
  {
    genreId: 18,
    nameEn: 'Drama',
    nameFa: 'درام',
    keywords: ['درام', 'اجتماعی', 'احساسی', 'واقع‌گرایانه', 'عمیق', 'غم‌انگیز', 'تراژیک', 'روابط انسانی', 'زندگی']
  },
  {
    genreId: 10749,
    nameEn: 'Romance',
    nameFa: 'عاشقانه',
    keywords: ['عاشقانه', 'رمانتیک', 'عشق', 'دلباخته', 'رابطه عاشقانه']
  },
  {
    genreId: 28,
    nameEn: 'Action',
    nameFa: 'اکشن',
    keywords: ['اکشن', 'بزن‌بزن', 'مبارزه', 'رزمی', 'انفجار', 'تعقیب و گریز', 'حادثه‌ای', 'اکشن مهیج']
  },
  {
    genreId: 53,
    nameEn: 'Thriller',
    nameFa: 'دلهره‌آور',
    keywords: ['دلهره‌آور', 'مهیج', 'پرکشش', 'هیجان‌انگیز', 'استرس‌زا', 'تعلیق', 'هیجان بالا', 'نفس‌گیر']
  },
  {
    genreId: 16,
    nameEn: 'Animation',
    nameFa: 'انیمیشن',
    keywords: ['انیمیشن', 'انیمه', 'کارتون', 'پویانمایی', 'مانگا', 'استودیو جیبلی']
  },
  {
    genreId: 12,
    nameEn: 'Adventure',
    nameFa: 'ماجراجویی',
    keywords: ['ماجراجویی', 'اکتشاف', 'سفر', 'بقا', 'جهان‌گردی', 'ماجراجویانه']
  },
  {
    genreId: 14,
    nameEn: 'Fantasy',
    nameFa: 'فانتزی',
    keywords: ['فانتزی', 'جادویی', 'جادو', 'افسانه‌ای', 'موجودات خیالی', 'جهان خیالی']
  },
  {
    genreId: 36,
    nameEn: 'History',
    nameFa: 'تاریخی',
    keywords: ['تاریخی', 'تاریخ باستان', 'بر اساس تاریخ', 'قرون وسطی', 'دوران کهن', 'واقعه تاریخی']
  },
  {
    genreId: 99,
    nameEn: 'Documentary',
    nameFa: 'مستند',
    keywords: ['مستند', 'مستند علمی', 'مستند حیات وحش', 'مستند جنایی']
  }
];

const KNOWN_REFERENCES: { [key: string]: { title: string; genreIds: number[]; vibes: string[] } } = {
  'interstellar': { title: 'Interstellar', genreIds: [878, 12, 18], vibes: ['فضایی', 'احساسی', 'فلسفی', 'حماسی'] },
  'اینتراستلار': { title: 'Interstellar', genreIds: [878, 12, 18], vibes: ['فضایی', 'احساسی', 'فلسفی', 'حماسی'] },
  'میان‌ستاره‌ای': { title: 'Interstellar', genreIds: [878, 12, 18], vibes: ['فضایی', 'احساسی', 'فلسفی', 'حماسی'] },
  'dune': { title: 'Dune: Part Two', genreIds: [878, 12], vibes: ['حماسی', 'کویر', 'سیاسی', 'بزرگ'] },
  'تل‌ماسه': { title: 'Dune: Part Two', genreIds: [878, 12], vibes: ['حماسی', 'کویر', 'سیاسی', 'بزرگ'] },
  'dark': { title: 'Dark', genreIds: [9648, 878, 18], vibes: ['پیچیده', 'زمانی', 'تاریک', 'معمایی'] },
  'دارک': { title: 'Dark', genreIds: [9648, 878, 18], vibes: ['پیچیده', 'زمانی', 'تاریک', 'معمایی'] },
  'تاریک': { title: 'Dark', genreIds: [9648, 878, 18], vibes: ['پیچیده', 'زمانی', 'تاریک', 'معمایی'] },
  'the bear': { title: 'The Bear', genreIds: [35, 18], vibes: ['پراسترس', 'آشپزی', 'واقع‌گرایانه', 'پرتنش'] },
  'خرس': { title: 'The Bear', genreIds: [35, 18], vibes: ['پراسترس', 'آشپزی', 'واقع‌گرایانه', 'پرتنش'] },
  'breaking bad': { title: 'Breaking Bad', genreIds: [18, 80], vibes: ['سقوط اخلاقی', 'نفس‌گیر', 'تبهکاری'] },
  'بریکینگ بد': { title: 'Breaking Bad', genreIds: [18, 80], vibes: ['سقوط اخلاقی', 'نفس‌گیر', 'تبهکاری'] },
  'se7en': { title: 'Se7en', genreIds: [80, 9648, 53], vibes: ['تاریک', 'بارانی', 'قاتل زنجیره‌ای', 'شوک‌آور'] },
  'seven': { title: 'Se7en', genreIds: [80, 9648, 53], vibes: ['تاریک', 'بارانی', 'قاتل زنجیره‌ای', 'شوک‌آور'] },
  'هفت': { title: 'Se7en', genreIds: [80, 9648, 53], vibes: ['تاریک', 'بارانی', 'قاتل زنجیره‌ای', 'شوک‌آور'] },
  'severance': { title: 'Severance', genreIds: [18, 9648, 878], vibes: ['محل کار', 'عجیب', 'معمایی', 'توطئه'] },
  'جداسازی': { title: 'Severance', genreIds: [18, 9648, 878], vibes: ['محل کار', 'عجیب', 'معمایی', 'توطئه'] },
  'parasite': { title: 'Parasite', genreIds: [35, 53, 18], vibes: ['طبقاتی', 'غافلگیرکننده', 'کره‌ای', 'هوشمندانه'] },
  'انگل': { title: 'Parasite', genreIds: [35, 53, 18], vibes: ['طبقاتی', 'غافلگیرکننده', 'کره‌ای', 'هوشمندانه'] },
  'chernobyl': { title: 'Chernobyl', genreIds: [18, 36], vibes: ['مستندگونه', 'فاجعه', 'پرتنش', 'واقعی'] },
  'چرنوبیل': { title: 'Chernobyl', genreIds: [18, 36], vibes: ['مستندگونه', 'فاجعه', 'پرتنش', 'واقعی'] }
};

export class PersianNlpService {
  /**
   * Parse user's Persian natural language prompt into a structured interpretation.
   */
  public static parsePrompt(prompt: string): StructuredInterpretation {
    const text = prompt.toLowerCase().trim();

    // 1. Media Type
    let mediaType: 'movie' | 'tv' | 'all' = 'all';
    const isTv = /(سریال|مجموعه|مینی‌سریال|مینیسریال|تک‌فصل|یک فصل|قسمت|اپیزود|فصل)/i.test(text);
    const isMovie = /(فیلم|سینمایی|مووی|فیلم سینمایی)/i.test(text);

    if (isTv && !isMovie) {
      mediaType = 'tv';
    } else if (isMovie && !isTv) {
      mediaType = 'movie';
    }

    // 2. Genres
    const matchedGenreIds: number[] = [];
    const matchedGenreNames: string[] = [];

    for (const rule of GENRE_RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw.toLowerCase())) {
          if (!matchedGenreIds.includes(rule.genreId)) {
            matchedGenreIds.push(rule.genreId);
            matchedGenreNames.push(rule.nameFa);
          }
          break;
        }
      }
    }

    // 3. Moods
    const moods: string[] = [];
    if (/(تاریک|سیاه|دارک|تلخ|غم‌انگیز)/i.test(text)) moods.push('تاریک و عمیق');
    if (/(امیدوارکننده|امیدبخش|حال‌خوب‌کن|شاد|دلگرم‌کننده|خوش‌ساخت)/i.test(text)) moods.push('امیدوارکننده و دلگرم');
    if (/(دلهره‌آور|تعلیق|نفس‌گیر|پرکشش|استرس|اضطراب)/i.test(text)) moods.push('دلهره‌آور و پرتعلیق');
    if (/(روانشناختی|ذهنی|روانی|سایکولوژیک)/i.test(text)) moods.push('روانشناختی');
    if (/(احساسی|عاطفی|گریه‌آور|اشک‌آور)/i.test(text)) moods.push('عمیقاً احساسی');
    if (/(سبک|آرامش‌بخش|راحت|بدون استرس)/i.test(text)) moods.push('سبک و آرام');
    if (/(فلسفی|اگزیستانسیال|مفهومی)/i.test(text)) moods.push('فلسفی و تامل‌برانگیز');

    // 4. Runtime
    let runtimeMax: number | undefined;
    if (/(زیر دو ساعت|کمتر از دو ساعت|کمتر از ۱۲۰ دقیقه|زیر ۱۲۰ دقیقه)/i.test(text)) {
      runtimeMax = 120;
    } else if (/(زیر نود دقیقه|زیر ۹۰ دقیقه|کمتر از ۹۰ دقیقه|کمتر از یک ساعت و نیم)/i.test(text)) {
      runtimeMax = 90;
    } else if (/(کوتاه|قسمت‌های کوتاه|قسمت کوتاه|اپیزود کوتاه)/i.test(text)) {
      runtimeMax = mediaType === 'tv' ? 35 : 95;
    }

    // 5. Minimum Rating
    let minimumRating: number | undefined;
    const ratingMatch = text.match(/(امتیاز|نمره)\s*(بالای|بیشتر از)?\s*([0-9]|۷|۸|۹|۱۰)(?:\.([0-9]|۵))?/i);
    if (ratingMatch) {
      let num = 7.5;
      if (text.includes('بالای ۸') || text.includes('بالای 8')) num = 8.0;
      else if (text.includes('بالای ۷.۵') || text.includes('بالای 7.5')) num = 7.5;
      else if (text.includes('بالای ۸.۵') || text.includes('بالای 8.5')) num = 8.5;
      else if (text.includes('بالای ۷') || text.includes('بالای 7')) num = 7.0;
      minimumRating = num;
    } else if (/(امتیاز بالا|شاهکار|نمره بالا|برنده جایزه|اسکار)/i.test(text)) {
      minimumRating = 7.8;
    }

    // 6. Narrative Preferences
    const narrativePreferences: string[] = [];
    if (/(پایان غیرقابل پیش‌بینی|پایان غیرقابل پیشبینی|توییست|غافلگیرکننده|پایان شوکه‌کننده|نتونم قاتل رو حدس بزنم)/i.test(text)) {
      narrativePreferences.push('پایان غیرقابل پیش‌بینی و غافلگیرکننده');
    }
    if (/(بر اساس واقعیت|داستان واقعی)/i.test(text)) {
      narrativePreferences.push('الهام‌گرفته از واقعیت');
    }
    if (/(تک‌فصل|یک فصل|مینی‌سریال|مینیسریال)/i.test(text)) {
      narrativePreferences.push('مینی‌سریال / داستان کامل در یک فصل');
    }
    if (/(شخصیت‌محور|روابط عمیق)/i.test(text)) {
      narrativePreferences.push('شخصیت‌پردازی عمیق');
    }

    // 7. Unwanted content (negations)
    const unwantedContent: string[] = [];
    if (/(بدون\s*جامپ\s*اسکر|بدون\s*جامپاسکر|جامپ\s*اسکر\s*زیاد|جامپاسکر\s*زیاد)/i.test(text)) {
      unwantedContent.push('جامپ‌اسکرهای ناگهانی و سطحی');
    }
    if (/(بدون\s*کلیشه\s*ها?ی?\s*عاشقانه|بدون\s*کلیشه\s*های?\s*عاشقانه|بدون\s*کلیشه\s*عاشقانه|بدون\s*کلیشه\s*ها?ی?\s*رمانتیک)/i.test(text)) {
      unwantedContent.push('کلیشه‌های تکراری عاشقانه');
    }
    if (/(نه\s*خیلی\s*تلخ|خیلی\s*تلخ\s*نباشه|کمی\s*سبکتر|سبک‌تر|کمی\s*روشن‌تر)/i.test(text)) {
      unwantedContent.push('سیاهی و تلخی مفرط');
    }
    if (/(بدون\s*خشونت|بدون\s*خون\s*و\s*خونریزی)/i.test(text)) {
      unwantedContent.push('خشونت شدید و خونریزی');
    }

    // 8. Reference Titles
    const referenceTitles: string[] = [];
    for (const [key, ref] of Object.entries(KNOWN_REFERENCES)) {
      if (text.includes(key)) {
        if (!referenceTitles.includes(ref.title)) {
          referenceTitles.push(ref.title);
          for (const gId of ref.genreIds) {
            if (!matchedGenreIds.includes(gId)) {
              matchedGenreIds.push(gId);
            }
          }
        }
      }
    }

    // 9. Build readable Persian summary of interpretation
    const summaryParts: string[] = [];
    if (mediaType === 'movie') summaryParts.push('فیلم سینمایی');
    else if (mediaType === 'tv') summaryParts.push('مجموعه تلویزیونی / مینی‌سریال');
    else summaryParts.push('فیلم یا سریال');

    if (matchedGenreNames.length > 0) {
      summaryParts.push(`در ژانر ${matchedGenreNames.slice(0, 3).join(' و ')}`);
    }
    if (moods.length > 0) {
      summaryParts.push(`با حال‌وهوای ${moods.join('، ')}`);
    }
    if (referenceTitles.length > 0) {
      summaryParts.push(`با الهام از فضای ${referenceTitles.join(' و ')}`);
    }
    if (runtimeMax) {
      summaryParts.push(`مدت زمان زیر ${runtimeMax} دقیقه`);
    }
    if (minimumRating) {
      summaryParts.push(`امتیاز حداقل ${minimumRating}`);
    }
    if (narrativePreferences.length > 0) {
      summaryParts.push(`با تأکید بر ${narrativePreferences.join(' و ')}`);
    }
    if (unwantedContent.length > 0) {
      summaryParts.push(`بدون ${unwantedContent.join(' و ')}`);
    }

    return {
      mediaType,
      genres: matchedGenreNames,
      genreIds: matchedGenreIds,
      mood: moods,
      runtimeMax,
      minimumRating,
      narrativePreferences,
      unwantedContent,
      referenceTitles,
      persianSummary: summaryParts.join(' • '),
      confidence: matchedGenreIds.length > 0 || moods.length > 0 ? 0.92 : 0.75,
      isAiPowered: false,
    };
  }
}

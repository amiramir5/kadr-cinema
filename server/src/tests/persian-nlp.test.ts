import { describe, it, expect } from 'vitest';
import { PersianNlpService } from '../services/persian-nlp.service';

describe('PersianNlpService (Natural Language Understanding for Persian Cinema Prompts)', () => {
  it('should correctly interpret dark mystery movie with unpredictable ending and rating/runtime limits', () => {
    const prompt = 'یه فیلم معمایی تاریک با پایان غیرقابل پیشبینی میخوام، ترجیحاً زیر دو ساعت و با امتیاز بالای ۷.۵';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.mediaType).toBe('movie');
    expect(interp.genreIds).toContain(9648); // Mystery
    expect(interp.mood.some(m => m.includes('تاریک'))).toBe(true);
    expect(interp.runtimeMax).toBe(120);
    expect(interp.minimumRating).toBe(7.5);
    expect(interp.narrativePreferences.some(n => n.includes('غیرقابل پیش‌بینی'))).toBe(true);
  });

  it('should interpret late night short comedy TV series', () => {
    const prompt = 'یه سریال کمدی با قسمتهای کوتاه برای آخر شب پیشنهاد بده.';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.mediaType).toBe('tv');
    expect(interp.genreIds).toContain(35); // Comedy
    expect(interp.runtimeMax).toBeLessThanOrEqual(35);
  });

  it('should extract reference title Interstellar and emotional mood', () => {
    const prompt = 'یه چیزی شبیه Interstellar ولی احساسیتر.';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.referenceTitles).toContain('Interstellar');
    expect(interp.genreIds).toContain(878); // Sci-Fi
    expect(interp.mood.some(m => m.includes('احساسی'))).toBe(true);
  });

  it('should recognize negations and unwanted romance cliches in uplifting movie', () => {
    const prompt = 'یه فیلم امیدوارکننده و خوشساخت، بدون کلیشههای عاشقانه.';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.mediaType).toBe('movie');
    expect(interp.mood.some(m => m.includes('امیدوارکننده'))).toBe(true);
    expect(interp.unwantedContent.some(u => u.includes('کلیشه‌های تکراری عاشقانه'))).toBe(true);
  });

  it('should identify horror without jump scares', () => {
    const prompt = 'یه فیلم ترسناک واقعاً دلهرهآور بدون جامپاسکر زیاد.';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.mediaType).toBe('movie');
    expect(interp.genreIds).toContain(27); // Horror
    expect(interp.unwantedContent.some(u => u.includes('جامپ‌اسکر'))).toBe(true);
  });

  it('should extract single season high rated crime miniseries', () => {
    const prompt = 'یه مینیسریال جنایی با امتیاز بالا و فقط یک فصل.';
    const interp = PersianNlpService.parsePrompt(prompt);

    expect(interp.mediaType).toBe('tv');
    expect(interp.genreIds).toContain(80); // Crime
    expect(interp.narrativePreferences.some(n => n.includes('تک فصل') || n.includes('مینی‌سریال'))).toBe(true);
    expect(interp.minimumRating).toBeGreaterThanOrEqual(7.5);
  });
});

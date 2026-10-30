import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../services/recommendation-engine';

describe('RecommendationEngine Pipeline', () => {
  it('should return valid ranked results and Persian explanation for a complex mystery prompt', async () => {
    const res = await RecommendationEngine.recommend({
      prompt: 'یه فیلم معمایی تاریک با پایان شوکه‌کننده و امتیاز بالای ۸',
    });

    expect(res).toBeDefined();
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.interpretation).toBeDefined();
    expect(res.interpretation.genreIds).toContain(9648);

    // Verify top candidate has match score and Persian explanation
    const top = res.results[0];
    expect(top.matchScore).toBeGreaterThanOrEqual(60);
    expect(top.matchReasonFa).toBeTruthy();
    expect(top.media.title).toBeTruthy();
  });

  it('should support conversational refinement to lighten mood', async () => {
    const original = 'یه فیلم معمایی تاریک';
    const refinement = 'اینها خیلی تلخ بودن، یه مقدار سبکتر پیشنهاد بده';

    const res = await RecommendationEngine.refine(original, refinement);
    expect(res).toBeDefined();
    expect(res.results.length).toBeGreaterThan(0);
  });
});

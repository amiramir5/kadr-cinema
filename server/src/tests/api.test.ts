import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('KADR API Endpoints', () => {
  it('GET /api/status should return health status and config object', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.config).toBeDefined();
    expect(typeof res.body.config.tmdbLive).toBe('boolean');
  });

  it('GET /api/genres should return list of genres with Persian translations', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.genres)).toBe(true);
    expect(res.body.genres.length).toBeGreaterThan(5);

    const mystery = res.body.genres.find((g: any) => g.id === 9648);
    expect(mystery).toBeDefined();
    expect(mystery.nameFa).toBe('معمایی');
  });

  it('POST /api/recommend should return structured results with Persian explanation', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({ prompt: 'یه فیلم معمایی دلهره‌آور با امتیاز بالای ۷.۵' });

    expect(res.status).toBe(200);
    expect(res.body.results).toBeDefined();
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.interpretation.genreIds).toContain(9648);
    expect(res.body.results[0].matchReasonFa).toBeTruthy();
  });

  it('GET /api/movie/693134 should return Dune: Part Two details with cast and videos', async () => {
    const res = await request(app).get('/api/movie/693134');
    expect(res.status).toBe(200);
    expect(res.body.title).toContain('Dune: Part Two');
    expect(res.body.titleFa).toContain('تل‌ماسه');
    expect(res.body.cast.length).toBeGreaterThan(0);
  });

  it('GET /api/explore should return filtered items', async () => {
    const res = await request(app).get('/api/explore?type=movie');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});

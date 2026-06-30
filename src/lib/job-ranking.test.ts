import { scoreAndRankJobs } from './job-ranking';

describe('scoreAndRankJobs', () => {
  test('returns empty array for empty job listings', () => {
    expect(scoreAndRankJobs([], [], [[1, 0]])).toEqual([]);
  });

  test('returns empty array for empty resume chunk embeddings', () => {
    expect(scoreAndRankJobs([{ id: '1', title: 'A', companyName: 'X', description: 'D', location: 'Remote', remote: true, url: 'u', tags: [] }], [], [])).toEqual([]);
  });

  test('sorts jobs by descending match score', () => {
    const jobs = [
      { id: '1', title: 'A', companyName: 'X', description: 'D', location: 'Remote', remote: true, url: 'u', tags: [] },
      { id: '2', title: 'B', companyName: 'Y', description: 'D', location: 'Remote', remote: false, url: 'u', tags: [] },
    ];

    const result = scoreAndRankJobs(jobs, [[1, 0], [0, 1]], [[1, 0], [1, 0]]);

    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  test('returns integer match scores between 0 and 100', () => {
    const jobs = [{ id: '1', title: 'A', companyName: 'X', description: 'D', location: 'Remote', remote: true, url: 'u', tags: [] }];
    const result = scoreAndRankJobs(jobs, [[1, 0]], [[0.2, 0.8]]);

    expect(Number.isInteger(result[0].matchScore)).toBe(true);
    expect(result[0].matchScore).toBeGreaterThanOrEqual(0);
    expect(result[0].matchScore).toBeLessThanOrEqual(100);
  });

  test('returns 100 for identical embeddings', () => {
    const jobs = [{ id: '1', title: 'A', companyName: 'X', description: 'D', location: 'Remote', remote: true, url: 'u', tags: [] }];
    const result = scoreAndRankJobs(jobs, [[1, 0]], [[1, 0]]);

    expect(result[0].matchScore).toBe(100);
  });
});

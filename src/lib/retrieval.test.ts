import { calculateOverallMatchScore, rankChunks } from './retrieval';

describe('rankChunks', () => {
  test('sorts chunks by similarity descending', () => {
    const queryEmbedding = [1, 0, 0];
    const chunks = [
      { id: 'a', section: 'experience', content: 'Alpha', embedding: [0.2, 0.8, 0] },
      { id: 'b', section: 'skills', content: 'Beta', embedding: [1, 0, 0] },
      { id: 'c', section: 'education', content: 'Gamma', embedding: [0.1, 0.1, 0.9] },
    ];

    const ranked = rankChunks(chunks, queryEmbedding, 3);

    expect(ranked.map((chunk) => chunk.id)).toEqual(['b', 'a', 'c']);
    expect(ranked[0].similarity).toBeGreaterThan(ranked[1].similarity);
  });
});

describe('calculateOverallMatchScore', () => {
  test('returns a high score for strong matches', () => {
    const score = calculateOverallMatchScore([
      { id: '1', section: 'experience', content: 'A', similarity: 0.9 },
      { id: '2', section: 'skills', content: 'B', similarity: 0.85 },
      { id: '3', section: 'education', content: 'C', similarity: 0.8 },
    ]);

    expect(score).toBeGreaterThan(80);
  });

  test('returns a low score for weak matches', () => {
    const score = calculateOverallMatchScore([
      { id: '1', section: 'experience', content: 'A', similarity: 0.2 },
      { id: '2', section: 'skills', content: 'B', similarity: 0.15 },
      { id: '3', section: 'education', content: 'C', similarity: 0.1 },
    ]);

    expect(score).toBeLessThan(30);
  });

  test('returns 0 for an empty list', () => {
    expect(calculateOverallMatchScore([])).toBe(0);
  });

  test('weights the top match more heavily than later matches', () => {
    const score = calculateOverallMatchScore([
      { id: '1', section: 'experience', content: 'A', similarity: 0.9 },
      { id: '2', section: 'skills', content: 'B', similarity: 0.2 },
      { id: '3', section: 'education', content: 'C', similarity: 0.1 },
    ]);

    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThan(70);
  });
});

import { cosineSimilarity } from './similarity';

describe('cosineSimilarity', () => {
  test('Identical vectors should return similarity of 1', () => {
    const result = cosineSimilarity([1, 0, 0], [1, 0, 0]);
    expect(result).toBeCloseTo(1, 5);
  });

  test('Orthogonal vectors should return similarity of 0', () => {
    const result = cosineSimilarity([1, 0], [0, 1]);
    expect(result).toBeCloseTo(0, 5);
  });

  test('Opposite vectors should return similarity of -1', () => {
    const result = cosineSimilarity([1, 0], [-1, 0]);
    expect(result).toBeCloseTo(-1, 5);
  });

  test('Vectors of different lengths should throw an error', () => {
    expect(() => cosineSimilarity([1, 0], [0, 1, 0])).toThrow(
      'Vectors must be the same length'
    );
  });

  test('Zero vector should return 0 similarity safely (not NaN)', () => {
    const result = cosineSimilarity([0, 0, 0], [1, 2, 3]);
    expect(result).toBe(0);
    expect(isNaN(result)).toBe(false);
  });
});

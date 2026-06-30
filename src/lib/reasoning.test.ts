import { generateFallbackAnalysis } from './reasoning';

describe('generateFallbackAnalysis', () => {
  test('returns a valid structure for an empty chunk list', () => {
    const result = generateFallbackAnalysis([], 0);

    expect(result).toEqual(
      expect.objectContaining({
        summary: expect.any(String),
        strengths: expect.any(Array),
        gaps: expect.any(Array),
        isAiGenerated: false,
      })
    );
  });

  test('includes the top chunk section name in the summary', () => {
    const result = generateFallbackAnalysis(
      [{ id: '1', section: 'experience', content: 'Built APIs', similarity: 0.8 }],
      80
    );

    expect(result.summary).toContain('experience');
  });

  test('says strong for high match scores', () => {
    const result = generateFallbackAnalysis([], 80);
    expect(result.summary).toContain('strong');
  });

  test('says limited for low match scores', () => {
    const result = generateFallbackAnalysis([], 20);
    expect(result.summary).toContain('limited');
  });

  test('caps strengths at three items', () => {
    const result = generateFallbackAnalysis(
      [
        { id: '1', section: 'experience', content: 'A', similarity: 0.9 },
        { id: '2', section: 'skills', content: 'B', similarity: 0.8 },
        { id: '3', section: 'projects', content: 'C', similarity: 0.7 },
        { id: '4', section: 'education', content: 'D', similarity: 0.6 },
      ],
      70
    );

    expect(result.strengths).toHaveLength(3);
  });
});

export type JobListing = {
  id: string;
  title: string;
  companyName: string;
  description: string;
  location: string;
  remote: boolean;
  url: string;
  tags: string[];
};

export async function fetchLiveJobListings(limit: number = 20): Promise<JobListing[]> {
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!response.ok) {
      throw new Error(`Arbeitnow API error: ${response.status}`);
    }

    const data = await response.json();
    const jobs = data.data || [];

    const normalized: JobListing[] = jobs.map((job: any) => ({
      id: job.slug || job.url,
      title: job.title,
      companyName: job.company_name,
      description: job.description?.replace(/<[^>]*>/g, '').slice(0, 1000) || '',
      location: job.location || 'Remote',
      remote: job.remote || false,
      url: job.url,
      tags: job.tags || [],
    }));

    const remoteFirst = [
      ...normalized.filter((j) => j.remote),
      ...normalized.filter((j) => !j.remote),
    ];

    return remoteFirst.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch job listings:', error);
    return [];
  }
}

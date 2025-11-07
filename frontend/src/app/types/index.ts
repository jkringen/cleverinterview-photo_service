/**
 * JobType data as returned from Job types API.
 */
export type JobType = { id: number; title: string; description: string; type: string };

/**
 * Job data as returned from Jobs API.
 */
export type Job = {
  id: number;
  user_id: string;
  job_id: number;
  status: string;
  parameters: any;
  results: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Represents a key/value pair (used in new job form).
 */
export type KeyValuePair = { key: string; value: string };

/**
 * Response data returned from Jobs API.
 */
export type JobsResponse = { jobs: Job[] };

/**
 * Response data returned from Job Types API.
 */
export type JobTypesResponse = { jobs: JobType[] };

/**
 * Query data from backend job types / jobs queries.
 */
export type JobsQueryData = { jobs: any[] };

/**
 * Represents a content item from the global TextContent.json data.
 * Supports all various configurations of what a content item can be.
 */
export type TextContentItem =
  | { id: string; type: 'header.large' | 'header'; text: string }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'list'; content: string[] };

/**
 * User session data.
 */
export type SessionData = { userEmail: string; apiToken: string };

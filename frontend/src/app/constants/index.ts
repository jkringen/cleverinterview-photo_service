/**
 * URL for the backend Jobs API.
 */
export const JOBS_API: string = `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/queued-jobs`;

/**
 * URL for the backend Job Types API.
 */
export const JOB_TYPES_API: string = `${process.env.NEXT_PUBLIC_BACKEND_API_URI}/jobs`;

/**
 * Tailwind CSS classes to apply for truncating content and applying ellipsis
 */
export const TAILWIND_TRUNCATE: string = 'max-w-0 overflow-hidden text-ellipsis whitespace-nowrap';

/**
 * Default badge color to use (not typed as string for IDE type issues with Badge component)
 */
export const DEFAULT_BADGE_COLOR = 'blue';

/**
 * Possible job status values.
 */
export class JobStatus {
  static PENDING: string = 'PENDING';
  static STARTED: string = 'STARTED';
  static SUCCESS: string = 'SUCCESS';
  static FAILED: string = 'FAILED';
}

/**
 * Mapping of JobStatus to color values for colorizing Job status display.
 */
export const STATUS_BADGE_COLOR_MAP = {
  [JobStatus.PENDING]: 'gray',
  [JobStatus.STARTED]: 'yellow',
  [JobStatus.SUCCESS]: 'green',
  [JobStatus.FAILED]: 'red',
} as const;

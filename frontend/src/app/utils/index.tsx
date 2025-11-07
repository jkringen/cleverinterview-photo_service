import { Badge, Heading } from '@radix-ui/themes';
import { QueryFunctionContext } from '@tanstack/react-query';
import PrimaryText from '../components/PrimaryText';
import { DEFAULT_BADGE_COLOR, JOB_TYPES_API, JOBS_API, STATUS_BADGE_COLOR_MAP } from '../constants';
import { Job, JobsResponse, JobType, JobTypesResponse, KeyValuePair, SessionData, TextContentItem } from '../types';
import { SafeHTML } from './SafeHTML';

/**
 * Clamps number between a minimum and maximum value.
 * @param {number} n Number to clamp
 * @param {number} min Min value
 * @param {number} max Max value
 * @returns {number}
 */
export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/**
 * Converts string to number safely.
 * @param {string} s Value to convert to number
 */
export function toNum(s: string | null): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Converts array of key/value pairs into a regular object representation.
 * @param pairs
 * @returns
 */
export function pairsToObject(pairs: KeyValuePair[]) {
  const obj: Record<string, string> = {};
  for (const { key, value } of pairs) obj[key] = JSON.parse(value);
  return obj;
}

/**
 * Renders a specific ContentItem on the page.
 * @param {TextContentItem} item Item to render
 * @returns
 */
export function renderContentNode(item: TextContentItem, index: number) {
  const key: string = `${item.type}-${index}`;
  switch (item.type) {
    case 'header.large': {
      return (
        <div key={key}>
          <Heading size="8">
            <SafeHTML html={item.text} />
          </Heading>
        </div>
      );
    }

    case 'header': {
      return (
        <div key={key}>
          <Heading size="5">
            <SafeHTML html={item.text} />
          </Heading>
        </div>
      );
    }

    case 'text': {
      return (
        <PrimaryText key={key}>
          <SafeHTML html={item.text} />
        </PrimaryText>
      );
    }

    case 'list': {
      const ListTag = 'ul';
      return (
        <div key={key}>
          <ListTag className="ml-5 list-disc marker:text-current">
            {item.content.map((li, i) => (
              <li key={`${key}-li-${i}`} className="mb-1">
                <PrimaryText>
                  <SafeHTML html={li} />
                </PrimaryText>
              </li>
            ))}
          </ListTag>
        </div>
      );
    }

    default: {
      // Exhaustiveness check (helps catch typos in content.type)
      const _never: never = item;
      return null;
    }
  }
}

/**
 * Given a Job record, returns the associated JobType record.
 * @param {Job} job
 * @returns {JobType}
 */
export function getJobTypeFromJob(job: Job, jobTypes: JobType[]): JobType | undefined {
  return jobTypes.find((jobType) => jobType.id === job.job_id);
}

/**
 * Returns a set of header used in backend API queries, using provided
 * apiToken to form the Bearer Token Authorization header.
 * @param {string} apiToken API Token to backend API auth
 */
export function getJobQueryAuthHeaders(apiToken: string): any {
  return {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Returns a tanstack query to get user jobs from the backend.
 * Uses refetchInterval and staleTime to actively re-query data while on page.
 * And refetchOnMount to ensure fresh data is retrieved on each page load.
 * @param {streing} apiToken API token for auth
 */
export function getJobsQuery(apiToken: string) {
  return {
    queryKey: ['jobs'],
    enabled: !!apiToken,
    queryFn: async ({ signal }: QueryFunctionContext) => {
      const r = await fetch(JOBS_API, {
        cache: 'no-store',
        signal,
        headers: getJobQueryAuthHeaders(apiToken),
      });
      if (!r.ok) throw new Error(`jobs HTTP ${r.status}`);
      return (await r.json()) as JobsResponse;
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
    refetchOnMount: 'always',
  };
}

/**
 * Returns a tanstack query to get user job types from the backend.
 * Uses staleTime to cache this data for a bit longer, since it changes less.
 * @param {streing} apiToken API token for auth
 */
export function getJobTypesQuery(apiToken: string) {
  return {
    queryKey: ['jobTypes'],
    enabled: !!apiToken,
    queryFn: async ({ signal }: QueryFunctionContext) => {
      const r = await fetch(JOB_TYPES_API, { cache: 'no-store', signal, headers: getJobQueryAuthHeaders(apiToken) });
      if (!r.ok) throw new Error(`job types HTTP ${r.status}`);
      return (await r.json()) as JobTypesResponse;
    },
    staleTime: 200000,
  };
}

/**
 * Normalize a string by returning a trimmed & lower case version.
 * @param {string} s Source string
 * @returns {string}
 */
export const normalize = (s: string) => s.toLowerCase().trim();

/**
 * Returns a <Badge /> component to represent the Job type.
 * @param {Job} job Job data
 * @returns {JSX.Element}
 */
export const getJobTypeBadge = (job: Job, jobTypes: JobType[]) => {
  return (
    <Badge radius="full" color={DEFAULT_BADGE_COLOR} size="3">
      {getJobTypeFromJob(job, jobTypes)?.type}
    </Badge>
  );
};

/**
 * Returns a <Badge/> component based on a Job status value.
 * @param {Job} job Job to generte status badge for
 * @returns {JSX.Element}
 */
export const getJobStatusBadge = (job: Job) => {
  return (
    <Badge radius="full" color={STATUS_BADGE_COLOR_MAP[job.status] || DEFAULT_BADGE_COLOR} size="3">
      {job.status}
    </Badge>
  );
};

/**
 * Returns relevant information from user session data.
 * @param {any} session User session data
 * @returns {SessionData}
 */
export const getSessionData = (session: any): SessionData => ({
  userEmail: session?.user?.email!,
  apiToken: session ? (session as any).apiToken : null,
});

'use client';

import { Flex } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useDeferredValue, useMemo, useState } from 'react';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import { getErrorDisplay } from '../fragments';
import { useTextContent } from '../TextContentContext';
import { Job, JobsQueryData, JobType, TextContentItem } from '../types';
import {
  getJobsQuery,
  getJobTypeFromJob,
  getJobTypesQuery,
  getSessionData,
  normalize,
  renderContentNode,
} from '../utils';
import JobsList from './JobsList';

/**
 * Expected search parameters for this page.
 */
interface PageParams {
  searchParams: { filter?: string; pageSize?: string; after?: string; before?: string };
}

/**
 * Combined jobs data (jobs and types).
 */
type JobsData = { types: JobType[]; jobs: Job[] } | null;

/**
 * Error message displayed is loading fails.
 */
const LOAD_ERROR_MSG: string = 'There was an unexpected error when loading Dashboard data, please try again.';

/**
 * Jobs Monitoring Dashboard page.
 * @param {PageParams} props Incoming props
 */
export default function Page({ searchParams }: PageParams) {
  // obtain auth session and loggged-in user email
  const { data: session } = useSession();
  const { apiToken } = getSessionData(session);

  // setup state to store the filter and provide a deferredFilter for changing it
  const [dataFilter, setDataFilter] = useState<string>(searchParams.filter || '');
  const deferredFilter = useDeferredValue(dataFilter);

  // execute jobs queries to get data from backed / cache
  const jobTypesQuery = useQuery(getJobTypesQuery(apiToken));
  const jobsQuery = useQuery(getJobsQuery(apiToken) as any);

  // combine data into single JobsData object
  // if a deferredFilter / query is defined, filter jobs by that filter, else return all
  const jobsData: JobsData = useMemo(() => {
    const q = normalize(deferredFilter);
    const jobTypes: JobType[] = jobTypesQuery.data ? (jobTypesQuery.data.jobs as JobType[]) : [];
    const jobsQueryData: JobsQueryData = jobsQuery.data as JobsQueryData;
    const jobs: Job[] = jobsQueryData ? (jobsQueryData.jobs as Job[]) : [];
    return {
      types: jobTypes,
      jobs: !q
        ? jobs
        : jobs.filter((job) => {
            const jobType: JobType | undefined = getJobTypeFromJob(job, jobTypes);
            return [job.user_id, job.notes ?? '', jobType?.title, jobType?.type, jobType?.description]
              .map((v) => normalize(String(v)))
              .some((v) => v.includes(q));
          }),
    };
  }, [jobTypesQuery.data, jobsQuery.data, deferredFilter]) as JobsData;

  // determine if we are in loading / error state
  const isLoading: boolean = jobTypesQuery.isLoading || jobsQuery.isLoading;
  const isError: boolean = jobTypesQuery.error !== null || jobsQuery.error !== null;

  /**
   * List of ContentItem objects to render, obtained from global textContent for this specific page.
   */
  const textContent = useTextContent();
  const items: TextContentItem[] = (textContent['/jobs'] as TextContentItem[]) ?? [];

  return (
    <Flex direction="column" mb="5">
      <Flex mb="5" direction="column" gap="5">
        {items.map((item, index) => renderContentNode(item, index))}
      </Flex>
      {isError && getErrorDisplay(LOAD_ERROR_MSG)}
      {!isError && (
        <>
          <SearchAndFilterBar
            jobs={jobsData?.jobs || []}
            filter={dataFilter}
            onFilterChange={setDataFilter}
            isReady={!isLoading && !isError}
          />
          <JobsList jobs={jobsData!.jobs} jobTypes={jobsData!.types} isLoading={isLoading} />
        </>
      )}
    </Flex>
  );
}

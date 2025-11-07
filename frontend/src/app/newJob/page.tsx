'use client';
import { Flex, Heading } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTextContent } from '../TextContentContext';
import { JobsQueryData, TextContentItem } from '../types';
import { getJobTypesQuery, getSessionData, renderContentNode } from '../utils';
import JobTypesList from './JobTypesList';
import { NewJobForm } from './NewJobForm';

/**
 * Renders page for user to submit a new Job and review the available
 * types of Jobs.
 */
const NewJobPage = () => {
  // obtain auth session and loggged-in user email
  const { data: session } = useSession();
  const { apiToken } = getSessionData(session);
  const pathname: string = usePathname();

  // execute job types query to get data from backed / cache
  const jobTypesQuery = useQuery(getJobTypesQuery(apiToken));
  const isLoading: boolean = jobTypesQuery.isLoading;

  // extract jobs list
  const jobsData: JobsQueryData = jobTypesQuery.data as JobsQueryData;
  const jobs: any = jobsData ? jobsData.jobs : [];

  /**
   * List of ContentItem objects to render, obtained from global textContent for this specific page.
   */
  const textContent = useTextContent();
  const items: TextContentItem[] = (textContent[pathname] as TextContentItem[]) ?? [];

  return (
    <Flex gap="5">
      <Flex direction="column" gap="5" mb="8">
        {items.map((item, index) => renderContentNode(item, index))}
        <Flex direction="column" gap="3">
          <Heading size="6">Available Job Types ({jobs.length})</Heading>
          <JobTypesList jobs={jobs} isLoading={isLoading} />
        </Flex>
      </Flex>
      <NewJobForm apiToken={apiToken} jobs={jobs} />
    </Flex>
  );
};

export default NewJobPage;

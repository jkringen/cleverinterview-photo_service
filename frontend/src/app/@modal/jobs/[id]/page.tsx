'use client';

import { JOBS_API } from '@/app/constants';
import { Job, JobsQueryData, JobType } from '@/app/types';
import {
  getJobQueryAuthHeaders,
  getJobsQuery,
  getJobStatusBadge,
  getJobTypeBadge,
  getJobTypeFromJob,
  getJobTypesQuery,
} from '@/app/utils';
import { SafeHTML } from '@/app/utils/SafeHTML';
import { Box, Button, Dialog, Flex, Heading, ScrollArea, Separator, Text } from '@radix-ui/themes';
import { QueryFunctionContext, useQueries } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Expected props for this component.
 */
interface Props {
  params: { id: string };
}

/**
 * Renders a modal that displays extended details about a Job record.
 * @param {Props} props Incoming props
 */
export default function JobModal({ params }: { params: { id: string } }) {
  // obtain auth session and loggged-in user email
  const { data: session } = useSession();
  const userIdEmail: string = session?.user?.email!;
  const apiToken: string = session ? (session as any).apiToken : null;

  // configure close operation to go back one page
  const router = useRouter();
  const close = () => router.back();

  // execute jobs queries to get data from backed / cache
  const id = Number(params.id);
  const [jobTypesQuery, jobsQuery, resultQuery] = useQueries({
    queries: [
      getJobTypesQuery(apiToken),
      getJobsQuery(apiToken) as any,
      {
        queryKey: [`result_${id}`],
        queryFn: async ({ signal }: QueryFunctionContext) => {
          const r = await fetch(`${JOBS_API}/${id}/result`, {
            cache: 'no-store',
            signal,
            headers: getJobQueryAuthHeaders(apiToken),
          });
          if (!r.ok) throw new Error(`result HTTP ${r.status}`);
          return (await r.json()) as any;
        },
      },
    ],
  });

  // get job, jobType, and result data extracted
  const jobsData: JobsQueryData = jobsQuery.data as JobsQueryData;
  const jobs: Job[] = jobsData ? (jobsData.jobs as Job[]) : [];
  const jobTypes: JobType[] = jobTypesQuery.data ? (jobTypesQuery.data.jobs as JobType[]) : [];
  const job: Job = jobs.find((job) => job.id === id) as Job;
  const jobType: JobType = getJobTypeFromJob(job, jobTypes) as JobType;
  const resultData: any = resultQuery.data ? resultQuery.data.result?.result : null;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Content maxWidth="90%">
        <Dialog.Title mb="1">
          <Flex gap="4">
            <Box>{jobType?.title}</Box>
            {getJobTypeBadge(job, jobTypes)}
            {getJobStatusBadge(job)}
          </Flex>
        </Dialog.Title>
        <Dialog.Description>
          <SafeHTML html={jobType?.description} />
        </Dialog.Description>
        <Separator size="4" mt="3" />
        <Flex direction="column" mt="3">
          <Dialog.Description>
            <b>Created:</b> {job?.created_at}
          </Dialog.Description>
          <Dialog.Description>
            <b>Completed:</b> {job?.updated_at}
          </Dialog.Description>
          <Separator size="4" mt="3" />
          <Flex gap="4" mt="4">
            <Heading size="4">Results:</Heading>
            <Text ml="auto" mr="2" className="text-gray-500 hover:cursor-default">
              DOWNLOAD
            </Text>
          </Flex>
          <ScrollArea type="always" scrollbars="vertical" style={{ maxHeight: 300 }}>
            <Box className="bg-black" p="4">
              {job && resultData ? (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(resultData, null, 2)}
                </pre>
              ) : job?.results ? (
                'Loading…'
              ) : (
                'N/A'
              )}
            </Box>
          </ScrollArea>
          <Heading size="4" mt="4">
            Parameters:
          </Heading>
          <ScrollArea type="always" scrollbars="vertical" style={{ maxHeight: 100 }}>
            <Box className="bg-black" p="4">
              {job && job.parameters ? (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(job.parameters, null, 2)}
                </pre>
              ) : job?.parameters ? (
                'Loading…'
              ) : (
                'N/A'
              )}
            </Box>
          </ScrollArea>
          <Flex justify="end" mt="4" gap="3">
            <Button variant="soft" onClick={close}>
              Close
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

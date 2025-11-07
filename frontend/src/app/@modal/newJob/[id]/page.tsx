'use client';

import { JobType } from '@/app/types';
import { getJobTypesQuery, getSessionData } from '@/app/utils';
import { SafeHTML } from '@/app/utils/SafeHTML';
import { Badge, Box, Button, Dialog, Flex, Heading, ScrollArea } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Expected props for this component.
 */
interface Props {
  params: { id: string };
}

/**
 * Renders a modal that displays extended information about a JobType record.
 * @param {Props} props Incoming Props
 */
export default function JobTypeModal({ params }: Props) {
  // obtain auth session for api token
  const { data: session } = useSession();
  const { apiToken } = getSessionData(session);

  // configure close operation to go back one page
  const router = useRouter();
  const close = () => router.back();

  // execute job types query to get data from backed / cache
  const jobTypesQuery = useQuery(getJobTypesQuery(apiToken));

  // extract jobType to display from data
  const id = Number(params.id);
  const jobTypes: JobType[] = jobTypesQuery.data ? (jobTypesQuery.data.jobs as JobType[]) : [];
  const jobType: JobType = jobTypes.find((jobType) => jobType.id === id) as JobType;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Content maxWidth="75%">
        <Dialog.Title mb="0">{jobType?.title}</Dialog.Title>
        <Badge radius="full" color="blue" size="3">
          {jobType?.type}
        </Badge>
        <Heading size="4" mt="4">
          Description:
        </Heading>
        <Flex direction="column" mt="3">
          <ScrollArea type="always" scrollbars="vertical" style={{ maxHeight: 320 }}>
            <Box className="bg-black text-lg" p="4">
              {jobType ? <SafeHTML html={jobType.description} /> : <></>}
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

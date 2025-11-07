'use client';

import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

/**
 * Renders a modal for Job Submitted success confirmation.
 */
export default function JobSubmittedModal() {
  // configure close operation to go back one page
  const router = useRouter();
  const close = () => router.back();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Content maxWidth="75%">
        <Dialog.Title mb="0">Job Submitted</Dialog.Title>
        <Dialog.Description>
          Your job has been submitted and will be processed shortly.
          <br />
          Please check the Jobs Monitoring Dashboard to view the status and results of your job.
        </Dialog.Description>
        <Flex justify="end" mt="4" gap="3">
          <Button variant="soft" onClick={close}>
            Close
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

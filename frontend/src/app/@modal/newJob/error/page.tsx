'use client';

import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';

/**
 * Renders a modal for Job Submitted error pop-up.
 */
export default function JobSubmitErrorModal() {
  // configure close operation to go back one page
  const router = useRouter();
  const close = () => router.back();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Content maxWidth="75%">
        <Dialog.Title mb="0">Job Submit Error</Dialog.Title>
        <Dialog.Description>
          There was an unexpected error when submitting your job, please try again.
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

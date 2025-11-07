import { Flex, Heading } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import PrimaryText from './components/PrimaryText';

export default async function Page() {
  return (
    <Flex direction="column">
      <Heading size="8">Async Job System</Heading>
      <Flex>
        <Flex direction="column" gap="3" mr="6">
          <PrimaryText className="mt-10">
            Async Job System is a streamlined way to submit background jobs, watch them run, and review results—all in
            one place. To get started,{' '}
            <Link href="/api/auth/signin">
              <b>sign in with Google</b>
            </Link>
            . Logging in is required before you can submit a job or access the{' '}
            <Link href="/jobs">
              <b>Jobs Monitoring Dashboard</b>
            </Link>
            .
          </PrimaryText>
          <PrimaryText>
            Once signed in, head to{' '}
            <Link href="/newJob">
              <b>Submit New Job</b>
            </Link>
            . This page presents a simple form where you'll first choose a Job type from the available options. After
            selecting a type, a configuration panel appears with fields specific to that job—so you can tailor the
            inputs, parameters, and payload to exactly what you need. When you submit the form, your request is saved
            and immediately enters a <b className="text-blue-500">PENDING</b> state while it waits to be picked up by
            the worker queue.
          </PrimaryText>
          <PrimaryText>
            To track progress, open the Jobs Monitoring Dashboard. This live table lists your newly submitted job along
            with all past submissions. When a job's status changes to <b className="text-yellow-300">STARTED</b>, the
            system has begun processing it. Once the work is complete, the status updates to either{' '}
            <b className="text-green-400">SUCCESS</b> or <b className="text-red-400">FAILED</b>. In both cases, the
            job's result output is attached to the record so you can review exactly what happened.
          </PrimaryText>
          <PrimaryText>
            Need details? Select any job in the dashboard table to open a quick pop-over that shows the full job data:
            inputs, current state, timestamps, and the complete result payload—which may include a large JSON document.
            This gives you a clear, audit-friendly view for debugging failures or validating successful runs without
            leaving the page.
          </PrimaryText>
          <PrimaryText>
            To keep the dashboard tidy, completed jobs remain visible for 1 hour after finishing, and then they're
            automatically purged from the system.
          </PrimaryText>
          <PrimaryText>
            Under the hood, the platform runs on a Python 3.12 backend with SQLAlchemy/Alembic for data persistence and
            Celery for background execution. The Next.js frontend communicates via API calls and uses NextAuth (Google /
            GitHub) for secure sign-in, providing a clean, modern workflow from submit → monitor → result.
          </PrimaryText>
        </Flex>
        <Flex direction="column" flexShrink="0">
          <h2>Async Job Flow</h2>
          <Image src="/diagram.png" width="400" height="600" alt="diagram"></Image>
        </Flex>
      </Flex>
    </Flex>
  );
}

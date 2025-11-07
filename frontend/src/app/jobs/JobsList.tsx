'use client';

import { Box, Flex, Table } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '../components/TableSkeleton';
import { JobStatus, TAILWIND_TRUNCATE } from '../constants';
import { Job, JobType } from '../types';
import { getJobStatusBadge, getJobTypeBadge, getJobTypeFromJob } from '../utils';

/**
 * Expected props for this component.
 */
interface Props {
  jobs: Job[];
  jobTypes: JobType[];
  isLoading: boolean;
}

/**
 * Renders a list/table of Job records, allowing for a click event to pop-up
 * additional information about the Job.
 * @param {Props} props Incoming props
 */
export default function JobsList({ jobs, jobTypes, isLoading }: Props) {
  const router = useRouter();
  /**
   * Defined headers to display in the table.
   */
  const headers: string[] = ['Job', 'Type', 'Status', 'Results', 'Notes'];

  /**
   * Column widths for the table layout in percentages (total 100%).
   */
  const colWidths = ['14%', '9%', '9%', '32%', '30%'];

  /**
   * Click handler for a table row, pushes user to detail page for
   * selected Job (using the id).
   * @param {number} id ID of the selected Job
   */
  const rowClickHandler = (id: number) => {
    console.log(`Job selected: ${id}`);
    router.push(`/jobs/${id}`, { scroll: false });
  };

  /**
   * Returns message to display in Result cell of Jobs display table,
   * based on the status of the provided Job record.
   * @param {Job} job Job data
   */
  const getJobResultRowDisplay = (job: Job) => {
    return [JobStatus.PENDING, JobStatus.STARTED].includes(job.status) ? 'Pending...' : 'Click to view results';
  };

  /**
   * Returns a list of Job data as table rows.
   * @param {Job} job Provided Job data
   * @returns {JSX.Element}
   */
  const getJobRow = (job: Job) => (
    <Table.Row key={job.id} className="hover:bg-blue-950 cursor-pointer" onClick={() => rowClickHandler(job.id)}>
      <Table.Cell>{getJobTypeFromJob(job, jobTypes)?.title}</Table.Cell>
      <Table.Cell>
        <Flex gap="2" wrap="nowrap">
          {getJobTypeBadge(job, jobTypes)}
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Flex gap="2" wrap="nowrap">
          {getJobStatusBadge(job)}
        </Flex>
      </Table.Cell>
      <Table.Cell className={`${TAILWIND_TRUNCATE} text-gray-500`}>{getJobResultRowDisplay(job)}</Table.Cell>
      <Table.Cell className={TAILWIND_TRUNCATE}>{job.notes}</Table.Cell>
    </Table.Row>
  );

  // render a table skeleton if we are still loading data
  if (isLoading) {
    return <TableSkeleton rows={2} columnWidths={colWidths} headers={headers}></TableSkeleton>;
  }

  return (
    <Box className="w-full overflow-hidden">
      <Table.Root variant="surface" size="3" className="jobs-table">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <Table.Header>
          <Table.Row>
            {headers.map((header) => (
              <Table.ColumnHeaderCell key={header}>
                <p>{header}</p>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body style={{ fontSize: '1.2rem' }}>
          {jobs.map((job) => {
            return getJobRow(job);
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

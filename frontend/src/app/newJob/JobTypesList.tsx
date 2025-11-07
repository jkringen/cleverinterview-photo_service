'use client';

import { Badge, Flex, Table } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '../components/TableSkeleton';
import { TAILWIND_TRUNCATE } from '../constants';
import { JobType } from '../types';

/**
 * Expected props for this component.
 */
interface Props {
  jobs: JobType[];
  isLoading: boolean;
}

/**
 * Renders a list/table of JobType records, allowing the user to select any record
 * to view extended information in a pop-up.
 * @param {Props} props Incoming props
 * @returns
 */
export default function JobTypesList({ jobs, isLoading }: Props) {
  const router = useRouter();
  jobs = jobs && Array.isArray(jobs) ? jobs : [];
  /**
   * Defined headers to display in the table.
   */
  const headers: string[] = ['Type', 'Title', 'Description'];

  /**
   * Column widths for the table layout in percentages (total 100%).
   */
  const colWidths = ['15%', '30%', '51%'];

  /**
   * Click handler for a table row, pushes user to detail page for
   * selected JobType (using the id).
   * @param {number} id ID of the selected JobType
   */
  const rowClickHandler = (id: number) => {
    router.push(`/newJob/${id}`, { scroll: false });
  };

  /**
   * Returns a list of JobType data as table rows.
   * @param {JobType} job Provided JobType data
   * @returns
   */
  const getJobTypeRow = (job: JobType) => (
    <Table.Row key={job.id} className="hover:bg-blue-950 cursor-pointer" onClick={() => rowClickHandler(job.id)}>
      <Table.Cell>
        <Flex gap="2" wrap="nowrap">
          {getJobTypeBadge(job)}
        </Flex>
      </Table.Cell>
      <Table.Cell>{job.title}</Table.Cell>
      <Table.Cell className={TAILWIND_TRUNCATE}>{job.description}</Table.Cell>
    </Table.Row>
  );

  /**
   * Returns a <Badge /> component to represent the JobType.
   * @param {JobType} job JobType data
   * @returns {JSX.Element}
   */
  const getJobTypeBadge = (job: JobType) => {
    return (
      <Badge radius="full" color="blue" size="3">
        {job.type}
      </Badge>
    );
  };

  // render a table skeleton if we are still loading data
  if (isLoading || !jobs || jobs.length == 0) {
    return <TableSkeleton rows={5} columnWidths={colWidths} headers={headers}></TableSkeleton>;
  }

  return (
    <Table.Root variant="surface" size="3">
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
          return getJobTypeRow(job);
        })}
      </Table.Body>
    </Table.Root>
  );
}

'use client';

import { Table, Skeleton } from '@radix-ui/themes';

/**
 * Expected props for this component.
 */
interface TableSkeletonProps {
  headers: string[];
  columnWidths: string[];
  rows?: number;
}

/**
 * Returns key ID with included type and index.
 * @param {string} type
 * @param {number} index
 */
const keyId = (type: string, index: number): string => `t-skel-${type}-${index}`;

/**
 * Renders a skeleton table for loading placeholder.
 * @param {TableSkeletonProps} props Incoming props
 */
export function TableSkeleton({ headers, columnWidths, rows = 6 }: TableSkeletonProps) {
  return (
    <Table.Root variant="surface" size="3">
      <colgroup>
        {columnWidths.map((width, index) => (
          <col key={keyId('col', index)} style={{ width }} />
        ))}
      </colgroup>
      <Table.Header>
        <Table.Row>
          {headers.map((header, index) => (
            <Table.ColumnHeaderCell key={keyId('header', index)}>
              <p>{header}</p>
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body style={{ fontSize: '1.2rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Table.Row key={keyId('row', i)}>
            {headers.map((_, index) => (
              <Table.Cell key={keyId('cell', index)}>
                <Skeleton width="100%" height="14px" />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

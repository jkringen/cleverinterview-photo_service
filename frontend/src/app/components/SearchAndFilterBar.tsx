'use client';
import { Flex, TextField } from '@radix-ui/themes';
import { searchInputIcon } from '../fragments';
import { Job } from '../types';
import PrimaryText from './PrimaryText';

/**
 * Expected props for this component.
 */
interface FilterBarProps {
  filter: string;
  jobs: Job[];
  onFilterChange: (value: string) => void;
  isReady: boolean;
}

/**
 * Renders a search / filter bar allowing the user to filter data.
 * @param {FilterBarProps} props Incoming props
 */
export default function SearchAndFilterBar({ jobs, filter, onFilterChange, isReady }: FilterBarProps) {
  const displayMsg: string = isReady ? `Displaying ${jobs.length} Jobs` : 'Loading...';
  return (
    <Flex gap="3" pb="5" pt="5" align="center">
      <PrimaryText color="gray">{displayMsg}</PrimaryText>
      <Flex ml="auto" gap="3" align="center">
        <PrimaryText>Search / Filtering:</PrimaryText>
        <TextField.Root
          placeholder="Search"
          size="3"
          value={filter}
          onChange={(e) => onFilterChange(e.currentTarget.value)}
        >
          <TextField.Slot>{searchInputIcon}</TextField.Slot>
        </TextField.Root>
      </Flex>
    </Flex>
  );
}

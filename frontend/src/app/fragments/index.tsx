import { Flex, Heading } from '@radix-ui/themes';
import Image from 'next/image';

/**
 * SVG search icon for the filter/search input box.
 */
export const searchInputIcon = (
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </g>
  </svg>
);

/**
 * Returns fragment to display error icon and message.
 * @param {string} message Error message to display
 */
export const getErrorDisplay = (message: string) => (
  <Flex justify="center" align="center">
    <Flex direction="column" width="93%" mt="8" align="center">
      <Image src="/error-icon.png" width="100" height="100" alt="lock" />
      <Heading size="6">{message}</Heading>
    </Flex>
  </Flex>
);

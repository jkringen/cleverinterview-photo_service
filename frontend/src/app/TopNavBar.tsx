'use client';
import { Avatar, Box, Flex, Separator, Text } from '@radix-ui/themes';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

/**
 * Link to be rendered in the nav bar.
 */
type LinkData = { title: string; uri: string };

/**
 * Renders the navigation bar at the top of the site.
 * Contains basic links for the various pages and a login / logout section.
 */
const TopNavBar = () => {
  const { status, data: session } = useSession();

  const pathname: string = usePathname();

  // determine if user is currently logged in
  const loggedIn: boolean = status === 'authenticated' && session != null;

  // styles for inactive and active links
  const linkStyles: string = 'hover:text-white hover:underline';
  const activeLinkStyles: string = 'text-white underline';
  const signInOutStyles: string = `${linkStyles} hover:cursor-pointer`;

  /**
   * List of links to render in the nav bar.
   */
  const links: LinkData[] = [
    { title: 'Submit New Job', uri: '/newJob' },
    { title: 'Jobs Monitoring Dashboard', uri: '/jobs' },
  ];

  // build user auth area of nav bar
  let userAuthSection: React.JSX.Element = !loggedIn ? (
    <Text className={signInOutStyles} onClick={() => signIn(undefined, { callbackUrl: pathname })}>
      Sign In
    </Text>
  ) : (
    <Flex align="center" gap="4">
      <Text>{session!.user!.name}</Text>
      <Avatar src={session!.user!.image ?? undefined} fallback={getUserInitials(session!.user!.name)} />
      <Separator orientation="vertical" style={{ width: 1, backgroundColor: '#ffffff88' }} className="mx-2" />
      <Text className={signInOutStyles} onClick={() => signOut({ callbackUrl: '/' })}>
        Sign Out
      </Text>
    </Flex>
  );

  return (
    <Flex gap="2" height="4rem" pl="5" className="bg-blue-400 text-blue-950 text-lg" align="center">
      <Link href="/">
        <Image src="/unchained.svg" alt="unchained" width="150" height="150" className="mr-5"></Image>
      </Link>
      {links.map((link, index) => (
        <Flex key={`link-box-${index}`} gap="2" align="center">
          <Link
            key={`link-${index}`}
            href={link.uri}
            className={pathname.startsWith(link.uri) ? activeLinkStyles : linkStyles}
          >
            {link.title}
          </Link>
          {index < links.length - 1 && (
            <Separator
              key={`sep-${index}`}
              orientation="vertical"
              style={{ width: 1, backgroundColor: '#ffffff88' }}
              className="mx-2"
            />
          )}
        </Flex>
      ))}
      <Flex flexGrow="1" />
      <Box mr="5">{userAuthSection}</Box>
    </Flex>
  );
};

/**
 * Returns the initials of the current logged in user.
 * @param {string} name User name
 * @returns {string}
 */
function getUserInitials(name: string | null | undefined): string {
  const nameSplit: string[] = name ? name.split(' ') : [];
  return `${nameSplit[0][0].toUpperCase()}${nameSplit[1][0].toUpperCase()}`;
}

export default TopNavBar;

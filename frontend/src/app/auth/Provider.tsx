'use client';

import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';

/**
 * Expected props for this component (only children).
 */
interface Props {
  children: ReactNode;
}

/**
 * Provides Session authentication wrapper around application.
 * @param {Props} props Incoming props (just children utilized)
 */
const AuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider refetchInterval={3 * 60} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;

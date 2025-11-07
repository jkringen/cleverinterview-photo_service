import { Theme, Flex } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from './auth/Provider';
import TopNavBar from './TopNavBar';
import QueryProvider from './utils/QueryProvider';
import './globals.css';
import textContent from '@/app/data/TextContent.json';
import { TextContentProvider } from './TextContentContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Unchained - Async Job System',
  description: 'A sample application for submitting and monitoring jobs to be processed.',
  icons: {
    icon: '/favicon.png',
  },
};

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RootLayout({ children, modal }: Readonly<Props>) {
  return (
    <html lang="en">
      <body>
        <Theme accentColor="blue" appearance="dark">
          <TextContentProvider value={textContent as any}>
            <AuthProvider>
              <TopNavBar />
              <main>
                <Flex justify="center">
                  <Flex direction="column" width="93%" mt="8">
                    <QueryProvider>
                      {children}
                      {modal}
                    </QueryProvider>
                  </Flex>
                </Flex>
              </main>
            </AuthProvider>
          </TextContentProvider>
        </Theme>
      </body>
    </html>
  );
}

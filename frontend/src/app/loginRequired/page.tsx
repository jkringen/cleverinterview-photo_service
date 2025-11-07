import { Flex, Heading } from '@radix-ui/themes';
import Image from 'next/image';

/**
 * Renders a 'Login Required' screen which instructs the user they must login before
 * they are able to view the requested page.
 */
const LoginReqPage = () => {
  return (
    <Flex justify="center" align="center">
      <Flex direction="column" width="93%" mt="8" align="center">
        <Image src="/lock.png" width="100" height="100" alt="lock" />
        <Heading size="6">You must login before you can access this feature.</Heading>
      </Flex>
    </Flex>
  );
};

export default LoginReqPage;

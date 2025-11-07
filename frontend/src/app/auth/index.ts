import { SignJWT, importPKCS8, JWTPayload } from 'jose';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// AUTH CONFIG VARS
export const AUTH_JWT_ISS = 'frontend.next';
export const AUTH_JWT_AUD = 'backend.flask';
export const API_TOKEN_TTL_SEC = 10 * 60;
export const API_TOKEN_SKEW_SEC = 60;

/**
 * Callback arg types for next/auth JWT callback.
 */
interface JwtCallbackArgs {
  token: any;
  account: any;
}

/**
 * Callback arg types for next/auth signIn callback.
 */
interface SignInCallbackArgs {
  profile: any;
  account: any;
}

/**
 * Callback arg types for next/auth session callback.
 */
interface SessionArgs {
  session: any;
  token: any;
}

/**
 * Global/singleton-ish private key result data.
 */
let privateKeyPromise: Promise<CryptoKey> | null = null;

/**
 * Returns a private key from the env variable value.
 */
function getPrivateKey() {
  if (!privateKeyPromise) {
    privateKeyPromise = importPKCS8(process.env.API_JWT_PRIVATE_KEY!, 'RS256');
  }
  return privateKeyPromise;
}

/**
 * Creates / mints a new signed JWT API token.
 * @param claims
 */
export async function mintApiToken(claims: JWTPayload) {
  const key: CryptoKey = await getPrivateKey();
  const now: number = Math.floor(Date.now() / 1000);
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', kid: 'main' })
    .setIssuer(AUTH_JWT_ISS)
    .setAudience(AUTH_JWT_AUD)
    .setIssuedAt(now)
    .setExpirationTime(now + 10 * 60) // 10 minutes
    .sign(key);
}

/**
 * Auth options for next/auth authentication with Google.
 * Includes callbacks / hooks for jwt token
 */
export const AUTH_OPTIONS = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: 'openid email profile' } },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // GitHub can hide primary email; include user:email to fetch verified emails
      authorization: { params: { scope: 'read:user user:email' } },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async signIn({ profile, account }: SignInCallbackArgs) {
      const email =
        (profile as any)?.email ??
        (Array.isArray((profile as any)?.emails) ? (profile as any).emails[0]?.value : undefined);
      if (!email) return false;
      return true;
    },
    async jwt({ token, account }: JwtCallbackArgs) {
      const now: number = Math.floor(Date.now() / 1000);
      const needsMint: boolean =
        !token.apiToken || !token.apiTokenExp || (token.apiTokenExp as number) - API_TOKEN_SKEW_SEC < now;

      if (needsMint && token.sub) {
        token.apiToken = await mintApiToken({
          sub: token.sub,
          email: token.email ?? undefined,
          roles: ['user'],
        });
        token.apiTokenExp = now + API_TOKEN_TTL_SEC;
      }

      return token;
    },
    async session({ session, token }: SessionArgs) {
      (session as any).apiToken = token.apiToken;
      (session.user as any).id = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

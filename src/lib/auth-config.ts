import { NextAuthOptions } from 'next-auth';
import Cognito from 'next-auth/providers/cognito';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUserByEmail } from '@/lib/tenant-utils';

function calculateSecretHash(username: string) {
  const message = username + process.env.COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', process.env.COGNITO_CLIENT_SECRET!);
  hmac.update(message);
  return hmac.digest('base64');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          const cognitoClient = new CognitoIdentityProviderClient({
            region: process.env.COGNITO_REGION,
            credentials: {
              accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
              secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || "",
            },
          });

          const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.COGNITO_CLIENT_ID!,
            AuthParameters: {
              USERNAME: credentials.email,
              PASSWORD: credentials.password,
              SECRET_HASH: calculateSecretHash(credentials.email),
            },
          });

          try {
            const response = await cognitoClient.send(command);
            const idToken = response.AuthenticationResult?.IdToken;
            
            if (!idToken) {
              console.error('Token não encontrado na resposta');
              return null;
            }

            const decoded = jwt.decode(idToken) as { sub: string; email: string; given_name: string };
            
            if (!decoded) {
              console.error('Erro ao decodificar o token');
              return null;
            }

            // Buscar informações do usuário no DynamoDB
            const user = await getUserByEmail(decoded.email);
            
            if (!user) {
              console.error('Usuário não encontrado no DynamoDB');
              return null;
            }

            return {
              id: decoded.sub,
              name: decoded.given_name || credentials.email,
              email: decoded.email,
              tenantId: user.tenantId,
              cognitoId: decoded.sub
            };
          } catch (cognitoError: any) {
            console.error('Erro Cognito:', cognitoError);
            if (cognitoError.name === 'NotAuthorizedException') {
              throw new Error('Email ou senha incorretos');
            }
            if (cognitoError.name === 'UserNotConfirmedException') {
              throw new Error('Email não confirmado. Por favor, verifique seu email e confirme seu cadastro.');
            }
            throw new Error(cognitoError.message || 'Erro na autenticação');
          }
        } catch (error: any) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      }
    }),
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`
    })
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.cognitoId = user.cognitoId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.tenantId = token.tenantId as string;
        session.user.cognitoId = token.cognitoId as string;
        session.user.email = session.user.email || '';
        session.user.name = session.user.name || '';
      }
      return session;
    }
  }
};

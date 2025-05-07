import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import crypto from 'crypto';

function calculateSecretHash(username: string) {
  const message = username + process.env.COGNITO_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', process.env.COGNITO_CLIENT_SECRET!);
  hmac.update(message);
  return hmac.digest('base64');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.COGNITO_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID_AWS || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS || "",
      },
    });

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      SecretHash: calculateSecretHash(email),
      Username: email,
    });

    await cognitoClient.send(command);

    return NextResponse.json({
      message: "Instruções de redefinição de senha foram enviadas para seu email",
    });
  } catch (error: any) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    return NextResponse.json(
      { 
        message: "Erro ao processar a solicitação de redefinição de senha",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

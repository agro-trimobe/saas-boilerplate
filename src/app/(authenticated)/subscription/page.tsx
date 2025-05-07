'use client';

import { SubscriptionPage } from './subscription-page';

export default function SubscriptionPageContainer() {
  // Dados do usuário - normalmente viriam da sessão
  const userData = {
    name: 'Trimobe',
    email: 'trimmobe@gmail.com'
  };
  
  return <SubscriptionPage userData={userData} />;
}

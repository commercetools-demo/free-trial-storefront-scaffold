import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ClientBuilder } from '@commercetools/ts-client';

const projectKey = process.env.CTP_PROJECT_KEY!;
const authUrl = process.env.CTP_AUTH_URL!;
const apiUrl = process.env.CTP_API_URL!;

function buildClient() {
  return new ClientBuilder()
    .withProjectKey(projectKey)
    .withClientCredentialsFlow({
      host: authUrl,
      projectKey,
      credentials: {
        clientId: process.env.CTP_CLIENT_ID!,
        clientSecret: process.env.CTP_CLIENT_SECRET!,
      },
      scopes: (process.env.CTP_SCOPES || '').split(' ').filter(Boolean),
    })
    .withHttpMiddleware({ host: apiUrl })
    .build();
}

// One module-level singleton, imported everywhere. Never instantiate
// ClientBuilder inside a page, component, or Route Handler.
export const apiRoot = createApiBuilderFromCtpClient(buildClient()).withProjectKey({ projectKey });

export { projectKey, apiUrl, authUrl };

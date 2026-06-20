declare global {
  interface Window {
    // We use the Enterprise SDK exclusively (loaded as `enterprise.js`
    // in `app/[locale]/layout.tsx`). The classic v3 namespace
    // (`window.grecaptcha.ready/.execute` without `.enterprise`) is
    // intentionally NOT declared — accessing it is a stale-code
    // signal that needs migrating to the `.enterprise.*` API.
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
    AppleID: {
      auth: {
        init: (config: {
          clientId: string;
          redirectURI: string;
          scope?: string;
          usePopup?: boolean;
          response_type?: string;
          response_mode?: string;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
            state?: string;
          };
          user?: {
            name?: { firstName?: string; lastName?: string };
            email?: string;
          };
        }>;
      };
    };
  }
}

export {};

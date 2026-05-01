declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
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

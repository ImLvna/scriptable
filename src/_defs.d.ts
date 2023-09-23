declare global {
  // Base url for the dev server
  export const BASE_URL: string;

  // Redeclaring this because typescript prefers the old one instead of @types/scriptable-ios
  interface Request {
    loadString: () => Promise<string>;
    loadJSON: () => Promise<unknown>;
  }
}

export {};

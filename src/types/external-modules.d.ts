// External module declarations for missing types

declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  export = cors;
}

declare module 'y-websocket/bin/utils' {
  export function setupWSConnection(ws: any, req: any, options?: any): void;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Global type augmentations
declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<any>;
    };
  }
}

export {};

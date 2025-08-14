declare module 'y-websocket' {
  export class WebsocketProvider {
    constructor(serverUrl: string, roomName: string, doc: any, options?: any);
    connect(): void;
    disconnect(): void;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    wsconnected: boolean;
  }

  export function messageAuth(message: any): any;
  export function messageAwareness(message: any): any;
  export function messageQueryAwareness(message: any): any;
  export function messageSync(message: any): any;
}

declare module 'y-websocket/bin/utils' {
  export function setupWSConnection(ws: any, req: any, ...args: any[]): void;
}

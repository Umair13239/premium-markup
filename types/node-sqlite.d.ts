// Minimal types for the Node built-in `node:sqlite` (not yet in @types/node v20).
declare module "node:sqlite" {
  interface StatementSync {
    get(...params: unknown[]): any;
    all(...params: unknown[]): any[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
    close(): void;
  }
}

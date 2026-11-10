import { Response } from "express";

export interface SSEConnection {
  id: string;
  res: Response;
  lastPing: number;
}

export class SSEManager {
  private connections: Map<string, SSEConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  setupConnection(id: string, res: Response): SSEConnection {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering for instant delivery

    // Flush headers if supported
    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    const conn: SSEConnection = {
      id,
      res,
      lastPing: Date.now(),
    };

    this.connections.set(id, conn);

    // Initial greeting / keep-alive
    this.sendEvent(id, "connected", { id, timestamp: Date.now() });

    res.on("close", () => {
      this.connections.delete(id);
    });

    return conn;
  }

  sendEvent(connectionId: string, event: string, data: any): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;

    try {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      conn.res.write(`event: ${event}\ndata: ${payload}\n\n`);
      return true;
    } catch {
      this.connections.delete(connectionId);
      return false;
    }
  }

  broadcast(event: string, data: any): void {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    for (const [id, conn] of this.connections.entries()) {
      try {
        conn.res.write(`event: ${event}\ndata: ${payload}\n\n`);
      } catch {
        this.connections.delete(id);
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [id, conn] of this.connections.entries()) {
        try {
          conn.res.write(": ping\n\n");
          conn.lastPing = Date.now();
        } catch {
          this.connections.delete(id);
        }
      }
    }, 15000); // 15 seconds heartbeat prevents 2G carrier socket drops
  }

  closeConnection(id: string): void {
    const conn = this.connections.get(id);
    if (conn) {
      try {
        conn.res.end();
      } catch {
        // ignore
      }
      this.connections.delete(id);
    }
  }
}

export const sseManager = new SSEManager();

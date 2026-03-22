import { terminalManager } from "./manager";
import type { TerminalActor } from "./actor";

interface WebSocketClient {
  send: (data: string) => void;
  closed: boolean;
}

interface TerminalMessage {
  type: "input" | "resize";
  data?: string;
  cols?: number;
  rows?: number;
}

export function handleTerminalConnection(terminalId: string, ws: Bun.ServerWebSocket<unknown>) {
  const actor = terminalManager.get(terminalId);

  if (!actor) {
    ws.send(JSON.stringify({ type: "error", message: "Terminal not found" }));
    ws.close();
    return;
  }

  const client: WebSocketClient = {
    send: (data) => ws.send(data),
    closed: false,
  };

  actor.send({ type: "CLIENT_CONNECT", client });

  ws.subscribe("terminal:close");

  ws.data = { actor, client };
}

export function handleTerminalMessage(ws: Bun.ServerWebSocket<unknown>, message: string) {
  const data = ws.data as { actor: TerminalActor; client: WebSocketClient } | undefined;

  if (!data) return;

  try {
    const parsed: TerminalMessage = JSON.parse(message);

    switch (parsed.type) {
      case "input":
        if (parsed.data) {
          data.actor.send({ type: "INPUT", data: parsed.data });
        }
        break;
      case "resize":
        if (parsed.cols !== undefined && parsed.rows !== undefined) {
          data.actor.send({ type: "RESIZE", cols: parsed.cols, rows: parsed.rows });
        }
        break;
    }
  } catch {
    // Ignore malformed messages
  }
}

export function handleTerminalClose(ws: Bun.ServerWebSocket<unknown>) {
  const data = ws.data as { actor: TerminalActor; client: WebSocketClient } | undefined;

  if (!data) return;

  data.client.closed = true;
  data.actor.send({ type: "CLIENT_DISCONNECT", client: data.client });
}

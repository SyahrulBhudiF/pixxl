import { RPCHandler } from "@orpc/server/bun-ws";
import { onError } from "@orpc/server";
import { router } from "./router";
import {
  handleTerminalConnection,
  handleTerminalMessage,
  handleTerminalClose,
} from "./features/terminal/ws-handler";
import * as Bun from "bun";

interface WsData {
  terminalId?: string;
}

const PORT = Number.parseInt(process.env.HONO_PORT || "3000", 10);

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

Bun.serve<WsData>({
  fetch(req, server) {
    // Extract terminalId from path before upgrade
    const url = new URL(req.url);
    const pathMatch = url.pathname.match(/^\/terminal\/(.+)$/);

    if (server.upgrade(req, { data: { terminalId: pathMatch?.[1] } })) {
      return;
    }

    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    async message(ws, message) {
      const terminalId = ws.data?.terminalId as string | undefined;

      if (terminalId) {
        handleTerminalMessage(ws, message.toString());
        return;
      }

      await handler.message(ws, message, {
        context: {},
      });
    },
    close(ws) {
      const terminalId = ws.data?.terminalId as string | undefined;

      if (terminalId) {
        handleTerminalClose(ws);
        return;
      }

      handler.close(ws);
    },
    open(ws) {
      const terminalId = ws.data?.terminalId as string | undefined;

      if (terminalId) {
        handleTerminalConnection(terminalId, ws);
      }
    },
  },
  port: PORT,
  development: true, // TODO: get this from env instead
});

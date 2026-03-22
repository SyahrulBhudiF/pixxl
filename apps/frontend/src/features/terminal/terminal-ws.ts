type TerminalMessage =
  | { type: "output"; data: string }
  | { type: "closed"; reason: string }
  | { type: "error"; message: string };

type TerminalClientMessage =
  | { type: "input"; data: string }
  | { type: "resize"; cols: number; rows: number };

type TerminalEventHandlers = {
  onOutput: (data: string) => void;
  onClose: (reason: string) => void;
  onError: (message: string) => void;
};

export function createTerminalConnection(terminalId: string, handlers: TerminalEventHandlers) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}//${host}/terminal/${terminalId}`);

  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    console.log(`[Terminal ${terminalId}] Connected`);
  };

  ws.onmessage = (event) => {
    try {
      const message: TerminalMessage = JSON.parse(event.data);

      switch (message.type) {
        case "output":
          handlers.onOutput(message.data);
          break;
        case "closed":
          handlers.onClose(message.reason);
          break;
        case "error":
          handlers.onError(message.message);
          break;
      }
    } catch {
      // Ignore malformed messages
    }
  };

  ws.onerror = () => {
    handlers.onError("WebSocket connection error");
  };

  ws.onclose = (event) => {
    console.log(`[Terminal ${terminalId}] Closed: ${event.reason}`);
    if (!event.wasClean) {
      handlers.onClose(event.reason || "Connection closed unexpectedly");
    }
  };

  const send = (message: TerminalClientMessage) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const sendInput = (data: string) => {
    send({ type: "input", data });
  };

  const sendResize = (cols: number, rows: number) => {
    send({ type: "resize", cols, rows });
  };

  const close = () => {
    ws.close();
  };

  return { sendInput, sendResize, close, ws };
}

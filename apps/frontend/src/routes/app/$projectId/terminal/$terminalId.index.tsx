import { useEffect, useRef } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Terminal, FitAddon } from "ghostty-web";
import { rpc } from "@/lib/rpc";

export const Route = createFileRoute("/app/$projectId/terminal/$terminalId/")({
  component: TerminalPage,
});

function TerminalPage() {
  const { terminalId } = useParams({ from: "/app/$projectId/terminal/$terminalId/" });
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fitAddon: FitAddon | null = null;

    const connectTerminal = async () => {
      // Initialize terminal
      const terminal = new Terminal({
        fontSize: 14,
        fontFamily: "JetBrains Mono, monospace",
        cursorStyle: "block",
        cursorBlink: true,
        theme: {
          background: "#1e1e2e",
          foreground: "#cdd6f4",
          cursor: "#f5e0dc",
        },
      });

      terminalRef.current = terminal;

      if (containerRef.current) {
        // Load and activate FitAddon
        fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        fitAddonRef.current = fitAddon;

        // Open terminal in container
        terminal.open(containerRef.current);

        // Fit terminal to container
        fitAddon.fit();

        // Connect to backend via WebSocket
        const result = await rpc.terminal.connectTerminal({ id: terminalId }).catch((err) => {
          console.error("Failed to connect to terminal:", err);
          return null;
        });

        if (!result?.success) {
          console.error("Failed to connect to terminal");
          return;
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}${result.websocketUrl}`);
        wsRef.current = ws;

        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
          console.log(`[Terminal ${terminalId}] Connected`);
          // Send initial resize after fit
          ws?.send(JSON.stringify({ type: "resize", cols: terminal.cols, rows: terminal.rows }));
        };

        ws.onmessage = (event) => {
          if (typeof event.data === "string") {
            try {
              const message = JSON.parse(event.data);
              if (message.type === "output") {
                const decoded = atob(message.data);
                terminal.write(decoded);
              } else if (message.type === "closed") {
                console.log(`[Terminal ${terminalId}] Closed: ${message.reason}`);
              } else if (message.type === "error") {
                console.error(`[Terminal ${terminalId}] Error: ${message.message}`);
              }
            } catch {
              // Ignore malformed messages
            }
          }
        };

        ws.onerror = () => {
          console.error(`[Terminal ${terminalId}] WebSocket error`);
        };

        ws.onclose = () => {
          console.log(`[Terminal ${terminalId}] Disconnected`);
        };

        // Handle terminal input
        terminal.onData((data) => {
          if (ws?.readyState === WebSocket.OPEN) {
            const encoded = btoa(data);
            ws.send(JSON.stringify({ type: "input", data: encoded }));
          }
        });

        // Handle resize events from terminal addon
        terminal.onResize(({ cols, rows }) => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "resize", cols, rows }));
          }
        });
      }
    };

    void connectTerminal().catch((err) => {
      console.error("Failed to initialize terminal:", err);
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
        const terminal = terminalRef.current;
        if (terminal && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "resize", cols: terminal.cols, rows: terminal.rows }),
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ws) {
        ws.close();
      }
      if (terminalRef.current) {
        terminalRef.current.dispose();
      }
    };
  }, [terminalId]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}

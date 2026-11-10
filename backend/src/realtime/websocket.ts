import { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { aiServiceClient } from "../services/aiService.js";
import { TutorRequest } from "../types/index.js";

export function setupWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let isAlive = true;

    ws.on("pong", () => {
      isAlive = true;
    });

    ws.on("message", async (data: Buffer | string) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;

          case "tutor:ask": {
            const tutorReq: TutorRequest = message.payload;
            ws.send(
              JSON.stringify({
                type: "tutor:status",
                payload: { status: "processing", question: tutorReq.question },
              })
            );

            try {
              const tutorRes = await aiServiceClient.askTutor(tutorReq);
              ws.send(
                JSON.stringify({
                  type: "tutor:answer",
                  payload: tutorRes,
                })
              );
            } catch (err: any) {
              ws.send(
                JSON.stringify({
                  type: "tutor:error",
                  payload: { error: err.message || "Failed to process tutor question" },
                })
              );
            }
            break;
          }

          default:
            ws.send(
              JSON.stringify({
                type: "echo",
                payload: message,
              })
            );
        }
      } catch (err: any) {
        ws.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Invalid JSON format" },
          })
        );
      }
    });

    // Ping every 30s to detect broken connections
    const interval = setInterval(() => {
      if (!isAlive) {
        clearInterval(interval);
        return ws.terminate();
      }
      isAlive = false;
      ws.ping();
    }, 30000);

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return wss;
}

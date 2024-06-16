import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { WebSocket, WebSocketServer } from "ws";

// This fixes Websocket issues in Firebot. Probably Dangerous.
try {
  if (!("WebSocket" in global)) {
    (global as any).WebSocket = WebSocket;
  }
} catch {}

interface Params {
  port: number;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Firebot Websocket Server",
      description: "Send and receive websocket message in firebot.",
      author: "SolarLabyrinth",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      port: {
        default: 9253,
        type: "number",
        description: "WebSocket Server Port",
        secondaryDescription:
          "The port to use for the WebSocket Server that firebot starts.",
      },
    };
  },
  run: (runRequest) => {
    const logger = runRequest.modules.logger;
    const wss = new WebSocketServer({ port: runRequest.parameters.port });

    type EffectType = {
      message: string;
    };

    runRequest.modules.effectManager.registerEffect<EffectType>({
      definition: {
        id: "solarlabyrinth:send-websocket-message",
        name: "Send WebSocket Message",
        description: "Broadcasts a WebSocket message to all connected clients",
        icon: "fad fa-signal-stream",
        categories: ["advanced"],
      },
      optionsTemplate: `
        <eos-container>
          <firebot-input 
            model="effect.message" 
            use-text-area="true"
            placeholder-text="Enter websocket message"
          />
        </eos-container>
      `,
      async onTriggerEvent(event) {
        try {
          for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(event.effect.message);
            }
          }
          return { success: true };
        } catch (e) {
          logger.error("There was an error sending a websocket message", e);
          return { success: false };
        }
      },
    });
  },
};

export default script;

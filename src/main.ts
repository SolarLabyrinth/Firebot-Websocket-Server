import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

import { WebSocket, WebSocketServer } from "ws";

try {
  console.log(global.WebSocket);
  (global as any).WebSocket = WebSocket;
} catch (e) {
  console.log(e);
}

interface Params {}

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
    return {};
  },
  run: (runRequest) => {
    const logger = runRequest.modules.logger;

    const wss = new WebSocketServer({
      port: 9253,
    });

    const clients = new Set<WebSocket>();

    wss.on("connection", (client) => {
      logger.info("Client Connected");
      clients.add(client);
    });

    type EffectType = {
      message: string;
    };

    runRequest.modules.effectManager.registerEffect<EffectType>({
      definition: {
        id: "solarlabyrinth:send-websocket-message",
        name: "Send Websocket Message",
        description: "Sends a websocket message",
        icon: "fa-duotone fa-tower-broadcast",
        categories: ["advanced"],
      },
      optionsTemplate: `
        <firebot-input 
          model="effect.message" 
          use-text-area="true"
          placeholder-text="Enter websocket message"
        />
      `,
      async onTriggerEvent(event) {
        try {
          const { effect } = event;

          console.log(clients);

          clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(effect.message);
            }
          });

          return {
            success: true,
          };
        } catch (e) {
          console.log(e);
          return {
            success: false,
          };
        }
      },
    });
  },
};

export default script;

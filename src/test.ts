import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:9253");

ws.on("error", console.error);

ws.on("open", function open() {
  console.log("Connected");
  ws.send("something");
});

ws.on("message", function message(data) {
  console.log("received: %s", data);
});

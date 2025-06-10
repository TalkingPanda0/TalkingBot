const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/kofi/webhook") {
    let body = "";

    req.on("data", (chunk) => {
      console.log("Ko-fi payment received", body);

      try {
        const paymentData = JSON.parse(body);
        console.log("Payment details:", paymentData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Webhook received");
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

const port = 3002;
server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});


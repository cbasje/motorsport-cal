import express from "express";
import cron from "node-cron";

import controllers from "./lib/controllers";
import { main as scrape } from "./lib/scraper";

const app = express();
const port = process.env.PORT || 3000;
const location = process.env.FLY_APP_NAME
    ? `${process.env.FLY_APP_NAME}.fly.dev`
    : `localhost:${port}`;

app.use(express.json());

app.get("/sessions", controllers.sessions.get);
app.delete("/sessions", controllers.sessions.delete);
app.post("/sessions", controllers.sessions.post);

app.get("/rounds", controllers.rounds.get);
app.delete("/rounds", controllers.rounds.delete);
app.post("/rounds", controllers.rounds.post);

app.get("/circuits", controllers.circuit.get);
app.patch("/circuits", controllers.circuit.patch);
app.delete("/circuits", controllers.circuit.delete);
app.post("/circuits", controllers.circuit.post);

app.get("/feed", controllers.feed.get);

app.get("/", async (req, res) => {
    return res.type("text/html").send(
        `
  <h1>Motorsport Calendar REST API</h1>
  <h2>Available Routes</h2>
  <table>
    <tr>
      <td>GET, POST, DELETE</td>
      <td><a href="/circuits">/circuits</a></td>
    </tr>
    <tr>
      <td>GET, POST, DELETE</td>
      <td><a href="/rounds">/rounds</a></td>
    </tr>
    <tr>
      <td>GET, POST, DELETE</td>
      <td><a href="/sessions">/sessions</a></td>
    </tr>
    <tr>
      <td>GET</td>
      <td><a href="/feed">/feed</a></td>
    </tr>
  </table>
  `.trim()
    );
});

// MARK: Start express app
app.listen(port, () => {
    console.log(`App listening at http://${location}`);
});

// MARK: Schedule scraper
scrape();
cron.schedule("0 0 * * FRI,SAT,SUN", scrape, {
    scheduled: true,
    timezone: "Europe/Amsterdam",
});

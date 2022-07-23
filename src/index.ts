import { PrismaClient } from "@prisma/client";
import express from "express";
import { getFeed } from "./feed";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/sessions", async (req, res) => {
    const sessions = await prisma.session.findMany({
        orderBy: { startDate: "desc" },
    });

    res.json(sessions);
});

// app.post("/sessions", async (req, res) => {
//     const todo = await prisma.session.create({
//         data: {
//             completed: false,
//             createdAt: new Date(),
//             text: req.body.text ?? "Empty todo",
//         },
//     });

//     return res.json(todo);
// });

app.get("/rounds", async (req, res) => {
    const rounds = await prisma.round.findMany({
        orderBy: { sport: "asc" },
        include: {
            _count: {
                select: { sessions: true },
            },
        },
    });

    res.json(rounds);
});

// app.post("/rounds", async (req, res) => {
//     const todo = await prisma.round.create({
//         data: {
//             completed: false,
//             createdAt: new Date(),
//             text: req.body.text ?? "Empty todo",
//         },
//     });

//     return res.json(todo);
// });

app.get("/locations", async (req, res) => {
    const locations = await prisma.location.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            _count: {
                select: { rounds: true },
            },
        },
    });

    res.json(locations);
});

// app.post("/locations", async (req, res) => {
//     const todo = await prisma.round.create({
//         data: {
//             completed: false,
//             createdAt: new Date(),
//             text: req.body.text ?? "Empty todo",
//         },
//     });

//     return res.json(todo);
// });

app.get("/feed", async (req, res, next) => {
    const sessions = await prisma.session.findMany({
        include: {
            round: {
                include: {
                    location: true,
                },
            },
        },
    });
    const response = await getFeed(sessions);

    return res.status(200).type("text/calendar").end(response);
});

app.get("/", async (req, res) => {
    res.send(
        `
  <h1>Motorsport Calendar REST API</h1>
  <h2>Available Routes</h2>
  <table>
    <tr>
      <td>GET, POST</td>
      <td><a href="/locations">/locations</a></td>
    </tr>
    <tr>
      <td>GET, POST</td>
      <td><a href="/rounds">/rounds</a></td>
    </tr>
    <tr>
      <td>GET, POST</td>
      <td><a href="/sessions">/sessions</a></td>
    </tr>
  </table>
  `.trim()
    );
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
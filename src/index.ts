import { PrismaClient } from "@prisma/client";
import express from "express";
import { DateTime } from "luxon";
import { getFeed } from "./feed";
import { createEvents } from "ics";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/sessions", async (req, res) => {
    const sessions = await prisma.session.findMany({
        orderBy: { startDate: "desc" },
    });

    return res.json(sessions);
});

app.post("/sessions", async (req, res) => {
    if (!req.body.roundId) throw new Error("'roundId' not defined)");
    if (!req.body.startDate || !req.body.endDate)
        throw new Error("dates not defined)");

    try {
        const session = await prisma.session.create({
            data: {
                createdAt: new Date(),
                type: req.body.type ?? "SHAKEDOWN",
                number: req.body.number ?? 0,
                round: {
                    connect: {
                        id: req.body.roundId,
                    },
                },
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
            },
        });

        return res.json(session);
    } catch (error: any) {
        throw new Error(
            "Something went wrong creating 'session': " + error.message
        );
    }
});

app.delete("/sessions", async (req, res) => {
    const sessions = await prisma.session.deleteMany({});
    return res.end();
});

app.get("/rounds", async (req, res) => {
    const rounds = await prisma.round.findMany({
        orderBy: { sport: "asc" },
        include: {
            sessions: true,
            _count: {
                select: { sessions: true },
            },
        },
    });

    return res.json(rounds);
});

app.post("/rounds", async (req, res) => {
    if (!req.body.title) throw new Error("'title' not defined)");

    const round = await prisma.round.create({
        data: {
            createdAt: new Date(),
            title: req.body.title,
            season: req.body.season ?? DateTime.now().year.toString(),
            sport: req.body.sport ?? "F1",
            circuit: {
                connect: {
                    id: req.body.circuitId,
                },
            },
            link: req.body.link,
        },
    });

    return res.json(round);
});

app.delete("/rounds", async (req, res) => {
    const rounds = await prisma.round.deleteMany({});
    return res.end();
});

app.get("/circuits", async (req, res) => {
    const circuits = await prisma.circuit.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            rounds: true,
            _count: {
                select: { rounds: true },
            },
        },
    });

    return res.json(circuits);
});

app.delete("/circuits", async (req, res) => {
    const circuits = await prisma.circuit.deleteMany({});
    return res.end();
});

// app.post("/circuits", async (req, res) => {
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
                    circuit: true,
                },
            },
        },
    });

    if (!sessions.length) throw new Error("No 'session' found");

    const events = await getFeed(sessions);
    createEvents(events, (error: Error | undefined, value: string) => {
        if (error) {
            console.error(error.message);
            throw error;
        }

        return res.type("text/calendar").send(value);
    });
});

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

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

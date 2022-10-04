import { Request, Response } from "express";
import { NewRound } from "~/types";
import prisma from "../prisma";

const getController = async (req: Request, res: Response) => {
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
};

const deleteController = async (req: Request, res: Response) => {
    const rounds = await prisma.round.deleteMany({});
    return res.end();
};

const postController = async (req: Request, res: Response) => {
    if (!req.body.data) throw new Error("'data' not defined)");

    const data = req.body.data as NewRound;
    console.info("Adding round:", data.title);

    const round = await prisma.round.upsert({
        create: {
            title: data.title,
            season: data.season,
            sport: data.sport,
            link: data.link,
            circuit: {
                connectOrCreate: {
                    where: {
                        title: data.circuitTitle,
                    },
                    create: {
                        title: data.circuitTitle,
                        // lon: 52.388819444444444,
                        // lat: 4.540922222222222,
                    },
                },
            },
        },
        update: {
            title: data.title,
            season: data.season,
            sport: data.sport,
            link: data.link,
        },
        where: {
            uniqueRoundPerSportSeason: {
                title: data.title,
                season: data.season,
                sport: data.sport,
            },
        },
    });
    return res.json(round);
};

export default {
    get: getController,
    delete: deleteController,
    post: postController,
};

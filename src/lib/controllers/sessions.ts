import { Request, Response } from "express";
import { NewSession } from "~/types";
import prisma from "../prisma";

const getController = async (req: Request, res: Response) => {
    const sessions = await prisma.session.findMany({
        orderBy: { startDate: "desc" },
    });

    return res.json(sessions);
};

const deleteController = async (req: Request, res: Response) => {
    const sessions = await prisma.session.deleteMany({});
    return res.end();
};

const postController = async (req: Request, res: Response) => {
    if (!req.body.data) throw new Error("'data' not defined)");

    const data = req.body.data as NewSession[];
    console.info("Adding %d sessions...", data.length);

    const sessions = await Promise.all(
        data.map(async (row: NewSession) => {
            return await prisma.session.upsert({
                create: {
                    type: row.type,
                    number: row.number,
                    roundId: row.roundId,
                    startDate: row.startDate,
                    endDate: row.endDate,
                },
                update: {
                    type: row.type,
                    number: row.number,
                    roundId: row.roundId,
                    startDate: row.startDate,
                    endDate: row.endDate,
                },
                where: {
                    uniqueSessionPerRoundId: {
                        type: row.type,
                        number: row.number,
                        roundId: row.roundId,
                    },
                },
            });
        })
    );

    return res.json(sessions);
};

export default {
    get: getController,
    delete: deleteController,
    post: postController,
};

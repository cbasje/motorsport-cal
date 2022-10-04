import { Request, Response } from "express";
import prisma from "../prisma";

const getController = async (req: Request, res: Response) => {
    const sessions = await prisma.session.findMany({
        include: {
            round: {
                include: {
                    circuit: true,
                },
            },
        },
    });

    return res.json(sessions);
};

export default {
    get: getController,
};

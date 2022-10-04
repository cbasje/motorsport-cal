import { Circuit } from "@prisma/client";
import { Request, Response } from "express";
import { NewCircuit } from "~/types";
import prisma from "../prisma";

const getController = async (req: Request, res: Response) => {
    const circuits = await prisma.circuit.findMany({
        orderBy: { created_at: "asc" },
        include: {
            rounds: true,
            _count: {
                select: { rounds: true },
            },
        },
    });
    return res.json(circuits);
};

const patchController = async (req: Request, res: Response) => {
    if (!req.body.data) throw new Error("'data' not defined)");

    const data = req.body.data as Circuit[];
    console.info("Updating %d circuits...", data.length);

    const circuits = await Promise.all(
        data.map(async (row: Circuit) => {
            return await prisma.circuit.update({
                data: {
                    wikipediaPageId: row.wikipediaPageId,
                    lat: row.lat,
                    lon: row.lon,
                },
                where: {
                    id: row.id,
                },
            });
        })
    );
    res.json(circuits);
};

const deleteController = async (req: Request, res: Response) => {
    const circuits = await prisma.circuit.deleteMany({});
    return res.end();
};

const postController = async (req: Request, res: Response) => {
    if (!req.body.data) throw new Error("'data' not defined)");

    const data = req.body.data as NewCircuit;
    const circuit = await prisma.circuit.create({
        data,
    });
    res.json(circuit);
};

export default {
    get: getController,
    patch: patchController,
    delete: deleteController,
    post: postController,
};

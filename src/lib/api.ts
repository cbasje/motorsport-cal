import { Round } from "@prisma/client";
import { NewRound, NewSession } from "../types";
import prisma from "./prisma";
import { CircuitTitle, CircuitWikipedia } from "./wikipedia";

export const getCircuits = async (): Promise<CircuitTitle[]> => {
    return await prisma.circuit.findMany({
        select: {
            id: true,
            title: true,
        },
    });
};

export const saveRound = async (row: NewRound): Promise<Round> => {
    console.info("Adding round:", row.title);

    return await prisma.round.upsert({
        create: {
            title: row.title,
            season: row.season,
            sport: row.sport,
            link: row.link,
            circuit: {
                connectOrCreate: {
                    where: {
                        title: row.circuitTitle,
                    },
                    create: {
                        title: row.circuitTitle,
                        // lon: 52.388819444444444,
                        // lat: 4.540922222222222,
                    },
                },
            },
        },
        update: {
            title: row.title,
            season: row.season,
            sport: row.sport,
            link: row.link,
        },
        where: {
            uniqueRoundPerSportSeason: {
                title: row.title,
                season: row.season,
                sport: row.sport,
            },
        },
    });
};

export const saveSessions = async (sessions: NewSession[]) => {
    console.info("Adding %d sessions...", sessions.length);

    return await Promise.all(
        sessions.map(async (row: NewSession) => {
            await prisma.session.upsert({
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
};

export const saveWikipediaData = async (data: CircuitWikipedia[]) => {};

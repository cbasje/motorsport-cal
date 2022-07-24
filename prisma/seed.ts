import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const testCircuit = await prisma.circuit.upsert({
        where: { title: "Circuit Zandvoort" },
        update: {},
        create: {
            id: "c69b4931-7997-46c8-88cd-d30639629cf1",
            title: "Circuit Zandvoort",
            long: 52.388819444444444,
            lat: 4.540922222222222,
        },
    });

    const testRound = await prisma.round.upsert({
        where: { title: "Test GP" },
        update: {},
        create: {
            id: "056b750e-ddcd-4db6-9058-e1a21edd7c6c",
            title: "Test GP",
            season: "2022",
            sport: "F1",
            circuit: {
                connect: {
                    id: testCircuit.id,
                },
            },
            link: "",
        },
    });

    const testSession = await prisma.session.create({
        data: {
            type: "PRACTICE",
            round: {
                connect: {
                    id: testRound.id,
                },
            },
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    console.log({ testCircuit, testRound, testSession });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

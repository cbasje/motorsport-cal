import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const testRound = await prisma.round.upsert({
        where: { title: "Test GP" },
        update: {},
        create: {
            title: "Test GP",
            season: "2022",
            sport: "F1",
            location: "Zandvoort",
            link: "",
        },
    });

    const testSession = await prisma.session.create({
        data: {
            title: "Test",
            roundId: testRound.id,
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    console.log({ testRound, testSession });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { Session, Round, Circuit } from "@prisma/client";
import { DateTime } from "luxon";
import type { DateArray, EventAttributes } from "ics";

const TITLE = "Motorsport Calendar";
const PRODUCT = "benjamiin..";

const getCalDate = (date: Date): DateArray => {
    const arr = DateTime.fromJSDate(date, { zone: "utc" })
        .toFormat("yyyy-M-d-H-m")
        .split("-")
        .map((s: string) => Number(s));
    return [arr[0], arr[1], arr[2], arr[3], arr[4]];
};

type RoundWithCircuit = Round & { circuit: Circuit };
type SessionWithRound = Session & { round: RoundWithCircuit };
export const getFeed = async (items: SessionWithRound[]) => {
    let events: EventAttributes[] = [];

    items.forEach((session) => {
        if (!session.startDate || !session.endDate) {
            return;
        }

        const type = session.type ? ` - ${session.type}` : "";
        const number = session.number !== 0 ? ` ${session.number}` : "";
        const title = `${session.round.sport} ${session.round.title}${type}${number}`;
        events.push({
            calName: TITLE,
            productId: PRODUCT,
            title,
            startInputType: "utc",
            start: getCalDate(session.startDate),
            end: getCalDate(session.endDate),
            description: `It is time for the ${title}! Watch this race and its sessions via this link: ${session.round.link}`,
            // htmlContent:
            // 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
            location: session.round.circuit.title,
            url: session.round.link,
            // geo: { lat: 40.0095, lon: 105.2669 },
        });
    });

    const response = await new Promise((resolve, reject) => {
        const ics = require("ics");
        ics.createEvents(events, (error: any, value: unknown) => {
            if (error) {
                console.log(error);
                reject(error);
            }

            resolve(value);
        });
    });

    return response;
};

import { Session, Round } from "@prisma/client";
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

type FeedItem = Session & { round: Round };
export const getFeed = async (items: FeedItem[]) => {
    let events: EventAttributes[] = [];

    items.forEach((session) => {
        if (!session.startDate || !session.endDate) {
            return;
        }

        events.push({
            calName: TITLE,
            productId: PRODUCT,
            title: session.title,
            startInputType: "utc",
            start: getCalDate(session.startDate),
            end: getCalDate(session.endDate),
            description: `It is time for the ${session.title}! Watch this race and its sessions via this link: ${session.round.link}`,
            // htmlContent:
            // 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
            location: session.round.location,
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

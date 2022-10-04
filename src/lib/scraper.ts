import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import { DateTime } from "luxon";
import { joinURL } from "ufo";
import {
    CircuitTitle,
    NewSession,
    SessionType,
    Sport,
    SportId,
} from "../types";

import { saveRound, saveSessions } from "./api";
import sports from "./sports";

const sessionAliases: Record<SessionType, string> = {
    SHAKEDOWN: "((?:Pre-Season|Session|Day)( \\d)?)",
    PRACTICE: "(Practice( \\d)?)",
    QUALIFYING: "((?:Qualifying|Qualifications|Hyperpole)( \\d)?)",
    RACE: "(Race|Round)",
    SPRINT: "(Sprint)",
};
const circuitAliases: Record<CircuitTitle, string> = {
    [CircuitTitle.Miami]: "(Miami)",
    [CircuitTitle.Bahrain]: "(Bahrain)",
    [CircuitTitle.Hungaroring]: "(Hungaroring)",
    [CircuitTitle.Spa]: "(Spa-Francorchamps)",
    [CircuitTitle.Monza]: "(Monza)",
    [CircuitTitle.AbuDhabi]: "(Yas[\\s-]?Marina|Abu[s-]?Dhabi)",
    [CircuitTitle.Mexico]: "(Mexico|Hermanos[\\s-]?Rodríguez)",
    [CircuitTitle.Monaco]: "(Monaco)",
    [CircuitTitle.GillesVilleneuve]: "(Montreal|Gilles[\\s-]?Villeneuve)",
    [CircuitTitle.Imola]: "(Imola|Dino[\\s-]?Ferrari)",
    [CircuitTitle.Jeddah]: "(Jeddah)",
    [CircuitTitle.AlbertPark]: "(Melbourne|Albert[\\s-]?Park)",
    [CircuitTitle.Barcelona]: "(Barcelona|Catalunya|Barcelona[\\s-]?Catalunya)",
    [CircuitTitle.Baku]: "(Baku)",
    [CircuitTitle.RedBull]: "(Red[\\s-]?Bull)",
    [CircuitTitle.Silverstone]: "(Silverstone)",
    [CircuitTitle.PaulRicard]: "(Paul[\\s-]?Ricard)",
    [CircuitTitle.Zandvoort]: "(Zandvoort)",
    [CircuitTitle.COTA]: "(COTA|Circuit of The Americas)",
    [CircuitTitle.Singapore]: "(Singapore|Marina[\\s-]?Bay)",
    [CircuitTitle.Suzuka]: "(Suzuka)",
    [CircuitTitle.Interlagos]: "(Interlagos|Carlos[\\s-]?Pace)",
    [CircuitTitle.StPetersburg]: "(St[\\s-]?Petersburg)",
    [CircuitTitle.Texas]: "(Texas)",
    [CircuitTitle.LongBeach]: "(Long[\\s-]?Beach)",
    [CircuitTitle.Barber]: "(Barber)",
    [CircuitTitle.Indy]: "(Indy|Indianapolis)",
    [CircuitTitle.BelleIsle]: "(Detroit|Belle[\\s-]?Isle)",
    [CircuitTitle.RoadAmerica]: "(Road[\\s-]?America)",
    [CircuitTitle.MidOhio]: "(Mid[\\s-]?Ohio)",
    [CircuitTitle.Toronto]: "(Toronto)",
    [CircuitTitle.Iowa]: "(Iowa)",
    [CircuitTitle.Nashville]: "(Nashville)",
    [CircuitTitle.Gateway]: "(Gateway)",
    [CircuitTitle.Portland]: "(Portland)",
    [CircuitTitle.LagunaSeca]: "(Laguna[\\s-]?Seca)",
    [CircuitTitle.Rome]: "(Rome)",
    [CircuitTitle.Berlin]: "(Berlin)",
    [CircuitTitle.Jakarta]: "(Jakarta)",
    [CircuitTitle.Marrakesh]: "(Marrakesh)",
    [CircuitTitle.NewYork]: "(New[\\s-]?York)",
    [CircuitTitle.London]: "(London)",
    [CircuitTitle.Seoul]: "(Seoul)",
    [CircuitTitle.LeMans]: "(Le[\\s-]?Mans)",
    [CircuitTitle.Fuji]: "(Fuji)",
};

export const main = async () => {
    try {
        console.time("Scraping...");
        await scrape();
        console.timeEnd("Scraping...");
    } catch (error: any) {
        fs.writeFile("scraper.log", error.toString(), {}, (err) => {});
        console.error("main: ", error.message);
    }
};

const getDate = (
    source: string | undefined,
    gmtOffset: string | undefined,
    plusHours = 0
): Date | undefined => {
    return source && source != "TBC"
        ? DateTime.fromISO(source + gmtOffset, { zone: "utc" })
              .plus({ hours: plusHours })
              .toJSDate()
        : undefined;
};
const getDatesFromString = (source: string, season: string) => {
    const string = source.trim();

    const regexTimes = /(\d{1,2}:\d{1,2} \w+)/g;
    const times = [...string.matchAll(regexTimes)];

    const startTime = times[0][0];
    const endTime = times[1][0];

    const regexDate = /(\w{3} \d{1,2})/g;
    const date = string.match(regexDate)![0];

    const regexTimeZone = /(\w+)$/g;
    const timeZone = string.match(regexTimeZone)![0];

    const startDate = `${date}, ${season}, ${startTime}`;
    const endDate = `${date}, ${season}, ${endTime}`;

    return [
        DateTime.fromFormat(startDate, "ff", {
            zone: "America/New_York",
        }).toJSDate(),
        DateTime.fromFormat(endDate, "ff", {
            zone: "America/New_York",
        }).toJSDate(),
    ];
};

const scrape = async () => {
    let includedSports: SportId[] = ["F1", "INDY"];

    for (const sport of sports) {
        if (includedSports.length && !includedSports.includes(sport.id))
            continue;

        const url = joinURL(sport.baseURL, sport.url);

        try {
            const { data: html } = await axios(url);

            const $ = cheerio.load(html);

            let sessions: NewSession[] = [];

            let i = 0;
            const elements = $(sport.list, html);
            for await (const el of elements) {
                // console.log(i++, sport.id);

                const linkString = $(el)
                    .find(sport.redirectURLItem)
                    .attr("href");
                const link = joinURL(
                    sport.baseURL,
                    linkString ?? "",
                    sport.redirectURLExtension
                );

                if (
                    sport.excludedURLs &&
                    sport.excludedURLs.some((url: string) => link.includes(url))
                )
                    continue;

                let newSessions = await scrapeItem(sport, link);
                if (newSessions) {
                    sessions.push(...newSessions);
                }
            }

            await saveSessions(sessions);
        } catch (error: any) {
            console.error("scrape: ", error.message);
            break;
        }
    }
};

const scrapeItem = async (
    sport: Sport,
    link: string
): Promise<NewSession[] | null> => {
    try {
        const { data: subHtml } = await axios(link);

        const sub$ = cheerio.load(subHtml);

        let roundTitle = "";
        if (sport.roundItems.title) {
            roundTitle = sub$(sport.roundItems.title, subHtml).first().text();
        } else if (sport.roundItems.titleAttr) {
            // @ts-ignore
            roundTitle = sub$(sport.roundItems.titleAttr.main, subHtml)
                .attr(sport.roundItems.titleAttr.title)
                .trim();
        }
        if (sport.roundItems.titleRegex) {
            const matches = roundTitle.match(
                new RegExp(sport.roundItems.titleRegex, "i")
            );
            roundTitle = matches && matches[1] ? matches[1].trim() : "";
        }

        let roundCircuit = "";
        if (sport.roundItems.circuit) {
            roundCircuit = sub$(sport.roundItems.circuit, subHtml)
                .first()
                .text();
        } else if (sport.roundItems.circuitAttr) {
            // @ts-ignore
            roundCircuit = sub$(sport.roundItems.circuitAttr.main, subHtml)
                .attr(sport.roundItems.circuitAttr.circuit)
                .trim();
        }
        if (sport.roundItems.circuitRegex) {
            const matches = roundCircuit.match(
                new RegExp(sport.roundItems.circuitRegex, "i")
            );
            roundCircuit = matches && matches[1] ? matches[1].trim() : "";
        }

        if (!roundTitle || !roundCircuit) return null;

        for (const alias in circuitAliases) {
            const regexString = circuitAliases[alias as CircuitTitle];
            const regex = new RegExp(regexString, "gi");

            if (regex.test(roundCircuit)) {
                roundCircuit = alias;
                break;
            }
        }

        const { id: roundId } = await saveRound({
            title: roundTitle,
            circuitTitle: roundCircuit,
            sport: sport.id,
            link,
            season: sport.season,
        });
        if (!roundId) return null;

        let sessions: NewSession[] = [];

        const subElements = sub$(sport.sessionList, subHtml);
        for await (const el of subElements) {
            let titleAliasFound = false;

            let sessionType = "";
            let sessionNumber = 0;
            if (sport.sessionItems.title) {
                sessionType = sub$(el)
                    .find(sport.sessionItems.title)
                    .first()
                    .text();
            } else if (sport.sessionItems.titleAttr) {
                // @ts-ignore
                sessionType = sub$(el)
                    .find(sport.sessionItems.titleAttr.main)
                    .attr(sport.sessionItems.titleAttr.title)
                    .trim();
            }

            for (const alias in sessionAliases) {
                const regexString = sessionAliases[alias as SessionType];
                const regex = new RegExp(regexString, "gi");

                if (regex.test(sessionType)) {
                    const numbers = sessionType.match(/\b\d?\b/gi);
                    const filteredNumbers = numbers?.filter((n) => n != "");
                    sessionNumber =
                        filteredNumbers && filteredNumbers[0]
                            ? Number(filteredNumbers[0])
                            : 0;

                    titleAliasFound = true;
                    sessionType = alias;
                    break;
                }
            }
            if (!titleAliasFound) continue;

            let startDateString: string | undefined = "",
                endDateString: string | undefined = "",
                gmtOffsetString: string | undefined = "",
                startDate: Date | undefined,
                endDate: Date | undefined;
            if (
                sport.sessionItems.dateAttr &&
                sport.sessionItems.dateAttr.main
            ) {
                startDateString = sub$(el)
                    .find(sport.sessionItems.dateAttr.main)
                    .attr(sport.sessionItems.dateAttr.startDate);
                endDateString = sport.sessionItems.dateAttr.endDate
                    ? sub$(el)
                          .find(sport.sessionItems.dateAttr.main)
                          .attr(sport.sessionItems.dateAttr.endDate)
                    : "";
                gmtOffsetString = sport.sessionItems.dateAttr.gmtOffset
                    ? sub$(el)
                          .find(sport.sessionItems.dateAttr.main)
                          .attr(sport.sessionItems.dateAttr.gmtOffset)
                    : "";

                startDate = getDate(startDateString, gmtOffsetString);
                endDate = endDateString
                    ? getDate(endDateString, gmtOffsetString)
                    : getDate(startDateString, gmtOffsetString, 2);
            } else if (sport.sessionItems.dateAttr) {
                startDateString = sub$(el).attr(
                    sport.sessionItems.dateAttr.startDate
                );
                endDateString = sport.sessionItems.dateAttr.endDate
                    ? sub$(el).attr(sport.sessionItems.dateAttr.endDate)
                    : "";
                gmtOffsetString = sport.sessionItems.dateAttr.gmtOffset
                    ? sub$(el).attr(sport.sessionItems.dateAttr.gmtOffset)
                    : "";

                startDate = getDate(startDateString, gmtOffsetString);
                endDate = endDateString
                    ? getDate(endDateString, gmtOffsetString)
                    : getDate(startDateString, gmtOffsetString, 2);
            } else if (sport.sessionItems.dateText) {
                const dates = getDatesFromString(
                    sub$(el).find(sport.sessionItems.dateText.date).text() +
                        " " +
                        sub$(el).find(sport.sessionItems.dateText.time).text(),
                    sport.season
                );
                startDate = dates[0];
                endDate = dates[1];
            }

            if (startDate && endDate) {
                sessions.push({
                    type: sessionType as SessionType,
                    number: sessionNumber,
                    startDate,
                    endDate,
                    roundId,
                });
            }
        }

        return sessions;
    } catch (error: any) {
        console.error("scrapeItem: ", error.message);
        return null;
    }
};

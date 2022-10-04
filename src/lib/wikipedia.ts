import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import qs from "qs";
import { joinURL } from "ufo";
import { Circuit } from "@prisma/client";
import { getCircuits, saveWikipediaData } from "./api";

export const main = async () => {
    try {
        console.time("scrape");
        const res = await scrape();
        await saveWikipediaData(res);
        console.timeEnd("scrape");
    } catch (error: any) {
        fs.writeFile("scraper.log", error.toString(), {}, (err) => {});
        console.error("main: ", error.message);
    }
};

const getDecimalDegrees = (input: RegExpMatchArray): number => {
    const [_, deg, min, sec, dir] = input;
    const directionSwap = dir === "S" || dir === "W" ? -1 : 1;

    return (
        (Number(deg) + Number(min) / 60 + Number(sec) / 3600) * directionSwap
    );
};

const getCoordinates = (
    coorString: string
): Record<"lat" | "lon", number> | null => {
    const regex = /(\d+)°(\d+)′(\d+(?:.\d+)?)″([NESW]{1})/g;
    const [lat, lon] = coorString.matchAll(regex);

    if (!lat || !lon) return null;

    return {
        lat: getDecimalDegrees(lat),
        lon: getDecimalDegrees(lon),
    };
};

type CircuitWithId = Omit<Circuit, "id" | "created_at"> & { id: string };
export type CircuitTitle = Pick<CircuitWithId, "id" | "title">;
export type CircuitWikipedia = Omit<CircuitWithId, "title"> & {
    wikipediaPageId: number;
};
const scrape = async (): Promise<CircuitWikipedia[]> => {
    const titles: CircuitTitle[] = await getCircuits();

    let response: CircuitWikipedia[] = [];
    for await (const t of titles) {
        const url = joinURL(
            "https://www.wikipedia.org",
            "w",
            "api.php?" +
                qs.stringify({
                    action: "parse",
                    prop: "text",
                    page: t.title,
                    format: "json",
                    formatversion: 2,
                })
        );

        try {
            const { data } = await axios(url);
            const $ = cheerio.load(data.parse.text);
            const text = $("table.infobox.vcard > tbody").first().text();
            const coordinatesIndex = text.indexOf("Coordinates");
            const hasCoordinates = coordinatesIndex != -1;

            let coordinates = null;
            if (hasCoordinates) {
                const string = text.slice(
                    coordinatesIndex + 11,
                    coordinatesIndex + 50
                );

                coordinates = getCoordinates(string);
            } else {
                throw new Error("No coordinates found");
            }

            response.push({
                id: t.id,
                wikipediaPageId: data.parse.pageid as number,
                lat: coordinates ? coordinates["lat"] : null,
                lon: coordinates ? coordinates["lon"] : null,
            });
        } catch (error: any) {
            console.error("🚨 Error scraping '%s':", t, error.message);
        }
    }

    return response;
};

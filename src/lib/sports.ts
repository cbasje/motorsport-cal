import { Sport } from "../types";

const sports: Sport[] = [
    {
        id: "F1",
        baseURL: "https://www.formula1.com",
        url: "en/racing/2022.html",
        season: "2022",

        list: ".completed-events > div:not(.seo-wrapper)",
        redirectURLItem: "a.event-item-link",
        redirectURLExtension: "",
        roundItems: {
            title: "title",
            titleRegex: "(\\b[\\w ]+ Grand Prix)|(Pre-Season \\b[\\w ]+\\b)",
            circuit: ".f1-race-hub--timetable-links-wrapper p",
        },
        sessionList: "div.f1-race-hub--timetable-listings > div.row",
        sessionItems: {
            title: "p.f1-timetable--title",
            dateAttr: {
                main: "",
                startDate: "data-start-time",
                endDate: "data-end-time",
                gmtOffset: "data-gmt-offset",
            },
        },
    },
    {
        id: "INDY",
        baseURL: "https://www.indycar.com",
        url: "Schedule",
        season: "2022",

        list: ".schedule-list ul > .schedule-list__item",
        redirectURLItem: ".schedule-list__links > a:last-child",
        redirectURLExtension: "",
        roundItems: {
            title: "title",
            titleRegex: "\\s([\\w -.]+)\\b",
            circuitAttr: {
                main: 'meta[property="og:url"]',
                circuit: "content",
            },
            circuitRegex: "IndyCar-Series/([\\w-]+)\\b",
        },
        sessionList: "#schedule .race-list > .race-list__item",
        sessionItems: {
            title: "div.race-list__race",
            dateText: {
                date: ".race-list__date",
                time: ".race-list__time",
            },
        },
    },
    {
        id: "FE",
        baseURL: "https://www.fiaformulae.com",
        url: "en/championship/race-calendar",
        season: "2021-2022",

        list: ".race-calendar-grid > .card",
        redirectURLItem: "a",
        redirectURLExtension: "schedule",
        roundItems: {
            title: "title",
            titleRegex: "20\\d\\d (\\b[\\w ]+ E-Prix)",
            circuit: "title",
            circuitRegex: "20\\d\\d (\\b[\\w ]+) E-Prix",
        },
        sessionList: ".event-schedule > .event",
        sessionItems: {
            title: "span.title",
            dateAttr: {
                main: ".event__watch-time .watch-time__copy > time.js-localise-time",
                startDate: "data-utc-start-datetime",
                endDate: "data-utc-end-datetime",
            },
        },
    },
    {
        id: "WEC",
        baseURL: "https://www.fiawec.com",
        url: "en/season/about",
        excludedURLs: ["-2", "diriyah"],
        season: "2022",

        list: ".race-slider > figure.seasontimeline-slide-info",
        redirectURLItem: ".seasontimeline-top-link > a",
        redirectURLExtension: "",
        roundItems: {
            titleAttr: {
                main: "h2.premain-first-container-title",
                title: "title",
            },
            titleRegex:
                "(\\b\\d{1,2} Hours of [\\w\\s]+)|(\\b\\d{4} Miles of [\\w\\s]+)",
            circuit: ".race-single-presentation-grey",
            circuitRegex: "The track of\\s+([\\w -]+)\\b",
        },
        sessionList: ".premain-first-container-timetable-suivi-right > div",
        sessionItems: {
            titleAttr: {
                main: "meta[itemprop=name]",
                title: "content",
            },
            dateAttr: {
                main: "meta[itemprop=startDate]",
                startDate: "content",
            },
        },
    },
];

export default sports;

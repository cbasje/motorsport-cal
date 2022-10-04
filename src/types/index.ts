import { Circuit, Round, Session } from "@prisma/client";

export type SportId = "F1" | "FE" | "XE" | "INDY" | "W" | "WEC";
export type SessionType =
    | "PRACTICE"
    | "QUALIFYING"
    | "RACE"
    | "SPRINT"
    | "SHAKEDOWN";
export enum CircuitTitle {
    Miami = "Miami International Autodrome",
    Bahrain = "Bahrain International Circuit",
    Hungaroring = "Hungaroring",
    Spa = "Circuit de Spa-Francorchamps",
    Monza = "Monza Circuit",
    AbuDhabi = "Yas Marina Circuit",
    Mexico = "Autódromo Hermanos Rodríguez",
    Monaco = "Circuit de Monaco",
    GillesVilleneuve = "Circuit Gilles Villeneuve",
    Imola = "Imola Circuit",
    Jeddah = "Jeddah Corniche Circuit",
    AlbertPark = "Albert Park Circuit",
    Barcelona = "Circuit de Barcelona-Catalunya",
    Baku = "Baku City Circuit",
    RedBull = "Red Bull Ring",
    Silverstone = "Silverstone Circuit",
    PaulRicard = "Circuit Paul Ricard",
    Zandvoort = "Circuit Zandvoort",
    COTA = "Circuit of the Americas",
    Singapore = "Marina Bay Street Circuit",
    Suzuka = "Suzuka International Racing Course",
    Interlagos = "Interlagos Circuit",
    StPetersburg = "St. Petersburg, Florida",
    Texas = "Texas Motor Speedway",
    LongBeach = "Long Beach, California",
    Barber = "Barber Motorsports Park",
    Indy = "Indianapolis Motor Speedway",
    BelleIsle = "Belle Isle Park (Michigan)",
    RoadAmerica = "Road America",
    MidOhio = "Mid-Ohio Sports Car Course",
    Toronto = "Grand Prix of Toronto",
    Iowa = "Iowa Speedway",
    Nashville = "Nashville Street Circuit",
    Gateway = "Gateway Motorsports Park",
    Portland = "Portland International Raceway",
    LagunaSeca = "WeatherTech Raceway Laguna Seca",
    Rome = "Circuito Cittadino dell'EUR",
    Berlin = "Tempelhof Airport Street Circuit",
    Jakarta = "Jakarta International e-Prix Circuit",
    Marrakesh = "Circuit International Automobile Moulay El Hassan",
    NewYork = "Brooklyn Street Circuit",
    London = "ExCeL London",
    Seoul = "Seoul ePrix",
    LeMans = "Circuit de la Sarthe",
    Fuji = "Fuji Speedway",
}

export interface Sport {
    id: SportId;
    baseURL: string;
    url: string;
    excludedURLs?: string[];
    season: string;

    list: string;
    redirectURLItem: string;
    redirectURLExtension: string;
    roundItems: {
        title?: string;
        titleRegex: string;
        titleAttr?: {
            main: string;
            title: string;
        };
        circuit?: string;
        circuitAttr?: {
            main: string;
            circuit: string;
        };
        circuitRegex?: string;
    };
    sessionList: string;
    sessionItems: {
        title?: string;
        titleAttr?: {
            main: string;
            title: string;
        };
        dateAttr?: {
            main: string;
            startDate: string;
            endDate?: string;
            gmtOffset?: string;
        };
        dateText?: {
            date: string;
            time: string;
        };
    };
}

export type NewRound = Omit<Round, "circuitId" | "id" | "created_at"> & {
    circuitTitle: string;
};
export type NewSession = Omit<Session, "id" | "created_at">;
export type NewCircuit = Omit<Circuit, "id" | "created_at">;

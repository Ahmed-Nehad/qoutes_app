import interface_quotesDB from "../../repositories/quotesDB";

export type interface_addLanguage = (database: interface_quotesDB, language: string) => Promise<void>;
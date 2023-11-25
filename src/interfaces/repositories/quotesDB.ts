import { language, quote } from "../../models/userModel";

export default interface interface_quotesDB {
    getQuoteById (language: language, id: number, Q_type: quote, index: number): Promise<string | null>;
    addQuotes (language: language, quotes: {[i in quote]:string[]}): Promise<void>;
    addNewLanguage (language: string): Promise<void>;
}
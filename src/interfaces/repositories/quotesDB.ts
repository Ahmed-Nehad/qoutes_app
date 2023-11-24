import { language, quote } from "../../models/userModel";

export default interface interface_quotesDB {
    getQuoteById (language: language, id: number, Q_type: quote, index: number): Promise<string | null>;
}
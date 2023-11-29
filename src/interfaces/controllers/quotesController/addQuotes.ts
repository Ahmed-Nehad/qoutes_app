import interface_quotesDB from "../../repositories/quotesDB";
import { language } from "../../../models/userModel";

export type interface_addQuotes = (database: interface_quotesDB, language: language, quotes: { [x: string]: string[]; }) => Promise<void>;
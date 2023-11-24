import GetQuoteById from "../repositories/mySql/quotesDB";
import { language, quote } from "../models/userModel";
import interface_quotesDB from "../interfaces/repositories/quotesDB";

let current_quotes_id = 1;
let index = 0;

export const getTodayQuote = async (db: interface_quotesDB, language: language, Q_type: quote): Promise<string | null> => {

    let quote: string | null = await db.getQuoteById(language, current_quotes_id , Q_type, index);

    if(!quote){

        current_quotes_id ++;

        console.info(`We changed the "current Quotes Id" from ${current_quotes_id - 1} to ${current_quotes_id}`)

        quote = await db.getQuoteById(language, current_quotes_id , Q_type as any, index);

        if(!quote){
            console.error(`error while changing the "current Quotes id" from ${current_quotes_id - 1} to ${current_quotes_id} please add new quotes to the database`)
            current_quotes_id --;
        }
    }
    return quote;
}

export const finishTheDay = async () => {
    index ++;
    console.info(`Finished the day and changed the "current quote index" from ${index-1} to ${index}`)
}
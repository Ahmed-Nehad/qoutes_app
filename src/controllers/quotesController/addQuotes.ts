import { interface_addQuotes } from "../../interfaces/controllers/quotesController/addQuotes";
import interface_quotesDB from "../../interfaces/repositories/quotesDB";
import { language } from "../../models/userModel";
import { languages, quotes_types } from "../../models/quotesModel";

export const addQuotes: interface_addQuotes = async (database: interface_quotesDB, language: language, quotes: { [x: string]: string[]; }) => {
    try{
        if(!languages.includes(language)) throw {statusCode: 400, message: `The specified "language": "${language}" isn't avilable. You can add a new language if you want`}

        if(Object.keys(quotes).length !== quotes_types.length || !Object.keys(quotes).every((element, index) => element === quotes_types[index])) {
            throw {statusCode: 400, message: `The specified "quotes" must have these keys "${quotes_types}". `};
        }

        Object.values(quotes).forEach(q => { 
            if (!Array.isArray(q))  throw {statusCode: 400, message: `The specified "quotes" must have string arrays for all the values. `}
        })

        await database.addQuotes(language, quotes);
    }catch(error: any){
        throw error.statusCode ? error : {statusCode: 500, message: "An unknown Error has occurred while creating the data", error}
    }
}
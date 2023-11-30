import { interface_addLanguage } from "../../interfaces/controllers/quotesController/addLanguage";
import interface_quotesDB from "../../interfaces/repositories/quotesDB";
import { languages } from "../../models/quotesModel";

export const addLanguage: interface_addLanguage = async (database: interface_quotesDB, language: string) => {
    try{

        if(languages.includes(language)) throw {statusCode: 409, message: `This language "${language}" already exist. `}

        await database.addNewLanguage(language);

        languages.push(language);
    }catch(error: any){
        throw error.statusCode ? error : {statusCode: 500, message: "An unknown Error has occurred while creating the data", error}
    }
}
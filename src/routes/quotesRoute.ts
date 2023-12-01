import { Router, Request, Response, NextFunction } from "express";
import authentication from "../middlewares/adminAuth";
import interface_quotesDB from "../interfaces/repositories/quotesDB";
import { interface_addQuotes } from "../interfaces/controllers/quotesController/addQuotes";
import { interface_addLanguage } from "../interfaces/controllers/quotesController/addLanguage";
//
import QuotesDB from "../repositories/mySql/quotesDB";
import { Pool } from "mysql2/promise";
import { addQuotes } from "../controllers/quotesController/addQuotes";
import { addLanguage } from "../controllers/quotesController/addLanguage";
//

export default function getQuotesRoute(dbPool: Pool){
    const dataBase = new QuotesDB(dbPool);
    return quotesRoute({
        dataBase,
        addQuotes,
        addLanguage
    })
}

export function quotesRoute(fns:{
        dataBase: interface_quotesDB, 
        addQuotes: interface_addQuotes,
        addLanguage: interface_addLanguage
    }){

    const router = Router();

    // auth the requests
    router.use('/', authentication);

    router.post('/', async (request: Request, response: Response) => {
        try{

            const { language, quotes } = request.body;

            if(!quotes || typeof quotes != 'object' || Object.keys(quotes).length == 0) throw {statusCode: 400, message: "you must include quotes as object"};
            if(!language || typeof language != 'string') throw {statusCode: 400, message: "you must include language as string"};

            await fns.addQuotes(fns.dataBase, language, quotes);

            response.sendStatus(201); // created

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    });

    router.post('/language', async (request: Request, response: Response) => {
        try{

            const { language } = request.body;

            if(!language || typeof language != 'string') throw {statusCode: 400, message: "you must include language as string"};

            await fns.addLanguage(fns.dataBase, language);

            response.sendStatus(201); // created

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    });

    return router;
};
import { Pool } from "mysql2/promise"
import { language, quote } from "../../models/userModel";
import interface_quotesDB from "../../interfaces/repositories/quotesDB";
require("dotenv").config();

const quotesTableName = process.env.quotesTableName;

export default class QuotesDB implements interface_quotesDB {
    mySqlPool: Pool;
    constructor(mySqlPool: Pool){
        this.mySqlPool = mySqlPool
    }

    async getQuoteById (language: language, id: number, Q_type: quote, index: number): Promise<string | null> {
        let [dbResponse,_] = await this.mySqlPool.execute(`select ${Q_type}->'$[${index}]' from ${quotesTableName}${language} where id = '${id}'`);

        const quote_object = (dbResponse as any)[0];
        const quote = quote_object ? Object.values(quote_object)[0] as string | null : null;
        
        return quote;
    } 
}
import { Pool } from "mysql2/promise"
import { language, quote } from "../../models/userModel";
import interface_quotesDB from "../../interfaces/repositories/quotesDB";
import { quotes_types } from "../../models/quotesModel";
require("dotenv").config();

const quotesTableName = process.env.quotesTableName;
const DB_NAME = process.env.DB_DATABASE;

export default class QuotesDB implements interface_quotesDB {
    mySqlPool: Pool;
    constructor(mySqlPool: Pool){
        this.mySqlPool = mySqlPool
    }

    async getQuoteById (language: language, id: number, Q_type: quote, index: number): Promise<string | null> {
        let [dbResponse,_] = await this.mySqlPool.execute(
            `select ${Q_type}->'$[${index}]' from ${quotesTableName}${language} where id = '${id}'`
            );

        const quote_object = (dbResponse as any)[0];
        const quote = quote_object ? Object.values(quote_object)[0] as string | null : null;
        
        return quote;
    } 

    async addQuotes(language: language, quotes: {[i in quote]:string[]}): Promise<void> {
        const newValues = Object.values(quotes).map( value => Array.isArray(value) ? `'[${value.map(e => `"${e}"`).join()}]'` : value);

        await this.mySqlPool.execute(`insert into ${quotesTableName}${language} values (0, ${newValues.join()})`);
    }

    async addNewLanguage(language: string): Promise<void> {

        const types = quotes_types.map(t => `${'`'}${t}${'`'} JSON NOT NULL,`).join('');

        const sql = `CREATE TABLE ${'`'}${DB_NAME}${'`'}.${'`'}quotes_${language}${'`'} (
            ${'`'}id${'`'} INT NOT NULL AUTO_INCREMENT,
            ${types}
            UNIQUE INDEX ${'`'}id_UNIQUE${'`'} (${'`'}id${'`'} ASC) VISIBLE,
            PRIMARY KEY (${'`'}id${'`'}));` 
            // replaced all the ` with ${'`'}

        await this.mySqlPool.execute(sql); 

    }
}
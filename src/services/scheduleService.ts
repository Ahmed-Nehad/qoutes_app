import cron from 'node-cron'
import { getEmailList } from './emailList'
import { getEmailDriver, sendEmail } from './emailService'
import { getTodayQuote, finishTheDay } from './quotesService';
import { language, quote } from '../models/userModel';
import { Pool } from 'mysql2/promise';
import QuotesDB from '../repositories/mySql/quotesDB';

export default async function startSending (db: Pool, hourOfDayToSendTheQuotes: number) {

    const transporter = getEmailDriver();
    const quotesDB = new QuotesDB(db);

    cron.schedule(`* ${hourOfDayToSendTheQuotes} * * *`, async () => {
        const emailList = getEmailList();

        Object.keys(emailList).forEach( language => {

            Object.keys(emailList[language as language]).forEach(async Q_type => {

                if(emailList[language as language][Q_type as quote].length > 0) {
                    const quote: string | null = await getTodayQuote(quotesDB, language as language, Q_type as quote);

                    if(quote){
                        const subject: string = `Did you hear today ${Q_type.split('_')[0]} quote !! -  Quotes app` 
                        const body: string = `Todays ${Q_type.split('_')[0]} quote is " ${quote} ".`;
                        
                        sendEmail(transporter, emailList[language as language][Q_type as quote], subject, body);
                    }
                }
            });
        });

        finishTheDay();
    });
}
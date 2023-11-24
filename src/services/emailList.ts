import { Pool } from "mysql2/promise";
import { quotes_types, languages } from "../models/quotesModel";
import { user } from "../models/userModel";
import UserDB from "../repositories/mySql/userDB";

let emailList : { 
    [i : string]: { 
        [i : string]: user['email'][] 
    } 
} = {};

export const initEmailList = async (database: Pool) => {
    // init the email list values with empty brackets
    languages.forEach(language => emailList[language] = {});
    quotes_types.forEach(Q_type => {
        languages.forEach(language => emailList[language][Q_type] = []);
    });

    const userDB = new UserDB(database);
    const users = await userDB.getAllUsers();

    users.forEach(user => {
        user.email_subs.forEach(email_sub => {
            emailList[user.language][email_sub].push(user.email);
        })
    })
    return emailList;
}

export const updateEmailList = (email: string, older: user["email_subs"], newer: user["email_subs"], language: user["language"]) => {
    if(older){
        older.forEach(Q_type => {
            const index = emailList[language][Q_type].indexOf(email);
            delete emailList[language][Q_type][index];
        })
    }
    if(newer){
        newer.forEach(Q_type => {
            emailList[language][Q_type].push(email);
        })
    }
}

export const getEmailList = () => emailList
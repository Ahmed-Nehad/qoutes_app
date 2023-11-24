import { Pool } from "mysql2/promise"
import { user } from "../../models/userModel"
import interface_userDB from "../../interfaces/repositories/userDB";
require("dotenv").config();

const usersDBTableName = process.env.usersDBTableName;

export default class UserDB implements interface_userDB {
    mySqlPool: Pool;
    constructor(mySqlPool: Pool){
        this.mySqlPool = mySqlPool
    }

    async createUser (user: user): Promise<void> {
        const newValues = Object.values(user).map( value => Array.isArray(value) ? `[${value.map(e => `"${e}"`).join()}]` : value);
        const newData = Object.keys(user).map((key, index)=>`'${newValues[index]}'`).join();

        await this.mySqlPool.execute(`insert into ${usersDBTableName} values (${newData})`);
    }

    async getAllUsers(): Promise<user[]> {
        const [dbResponse,_] = await this.mySqlPool.execute(`select * from ${usersDBTableName}`);
        return dbResponse as user[];
    }

    async getUser(id: user['id']): Promise<user | null> {
        const [dbResponse,_] = await this.mySqlPool.execute(`select * from ${usersDBTableName} where id = '${id}'`);
        return (dbResponse as any)[0] as user | null;
    }

    async getUserBy (tableName: String, value: any): Promise<user | null> {
        const [dbResponse,_] = await this.mySqlPool.execute(`select * from ${usersDBTableName} where ${tableName} = '${value}'`);
        return (dbResponse as any)[0] as user | null;
    }

    async updateUser (id: user['id'], data: object): Promise<void> {
        const newValues = Object.values(data).map( value => Array.isArray(value) ? `[${value.map(e => `"${e}"`).join()}]` : value);
        const newData = Object.keys(data).map((key, index)=>`${key} = '${newValues[index]}'`).join();

        await this.mySqlPool.execute(`update ${usersDBTableName} set ${newData} where id = '${id}'`);
    }

    async deleteUser (id: user['id']): Promise<void> {
        await this.mySqlPool.execute(`delete from ${usersDBTableName} where id = '${id}'`);
    }
}
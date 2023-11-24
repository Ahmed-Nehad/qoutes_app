import mysql from "mysql2";
require("dotenv").config();

export default function getMysqlDS() {
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD
    }).promise();
}
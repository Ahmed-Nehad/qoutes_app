import { Pool } from "mysql2/promise";
import { user } from "../../models/userModel";
import interface_userDB from "../repositories/userDB";

export type interface_checkUser = (dataBase: interface_userDB, user: user) => Promise<string>
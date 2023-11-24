import interface_userDB from "../../interfaces/repositories/userDB";
import { user } from "../../models/userModel";

export type interface_createUser = (dataBase: interface_userDB, user: user) => Promise<string>
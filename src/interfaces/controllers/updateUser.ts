import interface_userDB from "../../interfaces/repositories/userDB";
import { user } from "../../models/userModel";

export type interface_updateUser = (dataBase: interface_userDB, id: string, data: user) => Promise<void>
import interface_userDB from "../../interfaces/repositories/userDB";

export type interface_deleteUser =  (dataBase: interface_userDB, id: string) => Promise<void>
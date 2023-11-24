import interface_userDB from "../../interfaces/repositories/userDB";
import { language, quote } from "../../models/userModel";

export type interface_getUser = (dataBase: interface_userDB, id: string) => Promise<{
    email: string | undefined;
    email_subs: quote[] | undefined;
    language: language | undefined;
}| null>
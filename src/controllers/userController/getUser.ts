import interface_userDB from "../../interfaces/repositories/userDB";
import { interface_getUser } from "../../interfaces/controllers/getUser";

export const getUser:interface_getUser = async (dataBase:interface_userDB, id: string) => {
    try{
        const user =  await dataBase.getUser(id);

        if(!user){
            return null;
        }
        
        const newUser = {
            email: user?.email,
            email_subs: user?.email_subs,
            language: user?.language
        }

        return newUser;
    }catch(error){
        throw {statusCode: 500, message: "An unknown Error has occurred while reading the data", error}
    }
}
import { interface_deleteUser } from "../../interfaces/controllers/deleteUser";
import interface_userDB from "../../interfaces/repositories/userDB";

export const deleteUser:interface_deleteUser = async (dataBase:interface_userDB, id:string) => {
    try{
        await dataBase.deleteUser(id);
    }catch(error){
        throw {statusCode: 500, message: "An unknown Error has occurred while deleting the user", error}
    }
}
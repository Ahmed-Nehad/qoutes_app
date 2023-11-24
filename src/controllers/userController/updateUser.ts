import { user, userUpdateSchema } from "../../models/userModel";
import interface_userDB from "../../interfaces/repositories/userDB";
import { updateEmailList } from "../../services/emailList";
import bcrypt from 'bcrypt';
import { interface_updateUser } from "../../interfaces/controllers/updateUser";

export const updateUser: interface_updateUser = async (dataBase:interface_userDB, id:string, data: user) => {

    try{
        // validate the user data
        await userUpdateSchema.validateAsync(data);
    }catch(error: any){
        throw {statusCode: 400, message: error.message}
    }

    try{

        const oldUser =  await dataBase.getUser(id);

        if(data.email_subs !== oldUser?.email_subs!){
            updateEmailList(oldUser?.email!, oldUser?.email_subs!, data.email_subs, oldUser?.language!);
        }
        
        // check if there is a password and hash it
        data.password &&= await bcrypt.hash(data.password, 10);
        // update the user in the mysql database
        await dataBase.updateUser(id, data);
    }catch(error){
        throw {statusCode: 500, message: "An unknown Error has occurred while updating the user", error}
    }
}
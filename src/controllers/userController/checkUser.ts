import { interface_checkUser } from "../../interfaces/controllers/checkUser";
import { user, userRequestSchema } from "../../models/userModel";
import interface_userDB from "../../interfaces/repositories/userDB";
import bcrypt from 'bcrypt';

export const checkUser: interface_checkUser = async (dataBase:interface_userDB, user: user) => {
    try{
        await userRequestSchema.validateAsync(user);
    }catch(error: any){
        throw {statusCode: 400, message: error.message}
    }

    try{
        const newUser =  await dataBase.getUserBy('email', user.email);

        if(newUser){
            const isPasswordMatch =  await bcrypt.compare(user.password, newUser.password)
            if(!isPasswordMatch){
                throw {statusCode: 404, message: "could't find any user with this data!"}
            }
        }else{
            throw {statusCode: 404, message: "could't find any user with this data!"}
        }

        return newUser.id;
    }catch(error: any){
        throw error.statusCode ? error : {statusCode: 500, message: "An unknown Error has occurred while reading the data", error}
    }
}
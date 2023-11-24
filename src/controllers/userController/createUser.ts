import { user, userRequestSchema } from "../../models/userModel";
import bcrypt from 'bcrypt';
import { interface_createUser } from "../../interfaces/controllers/createUser";
import interface_userDB from "../../interfaces/repositories/userDB";

export const createUser: interface_createUser = async (dataBase:interface_userDB, user: user) => {
    try{
        user = await userRequestSchema.validateAsync(user);
    }catch(error: any){
        throw {statusCode: 400, message: error.message}
    }

    let newUser: user = Object.assign({ id: newId() }, user)

    // hash the password
    newUser.password = await bcrypt.hash(user.password, 10);

    try{
        await dataBase.createUser(newUser);
    }catch(error: any){
        if(error.message && error.message.includes('Duplicate entry')) throw {statusCode: 400, message: "This email is already in use!"}
        else throw {statusCode: 500, message: "An unknown Error has occurred while creating the user", error}
    }

    return newUser.id;
}

const newId = () =>{
    let id = '';
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++)
        id += characters.charAt( Math.floor( Math.random() * charactersLength ) );
    return id
}
import { Router, Request, Response, NextFunction } from "express";
import interface_userDB from "../interfaces/repositories/userDB";
import { user } from "../models/userModel";
import authentication from "../middlewares/userAuth";
import { interface_authUser, interface_createTokens } from "../interfaces/services/auth/userAuth";
import { interface_checkUser } from "../interfaces/controllers/checkUser";
import { interface_createUser } from "../interfaces/controllers/createUser";
import { interface_deleteUser } from "../interfaces/controllers/deleteUser";
import { interface_updateUser } from "../interfaces/controllers/updateUser";
import { interface_getUser } from "../interfaces/controllers/getUser";
///
import { authUser, createTokens } from "../services/auth/userAuth";
import { createUser } from "../controllers/userController/createUser";
import { deleteUser } from "../controllers/userController/deleteUser";
import { getUser } from "../controllers/userController/getUser";
import { updateUser } from "../controllers/userController/updateUser";
import { checkUser } from "../controllers/userController/checkUser";
import { Pool } from "mysql2/promise";
import UserDB from "../repositories/mySql/userDB";
///

export default function getUserRoute(dbPool: Pool){
    const dataBase = new UserDB(dbPool);
    return userRoute({
        dataBase,
        authUser,
        createTokens,
        createUser,
        getUser,
        deleteUser,
        updateUser,
        checkUser
    })
}

export function userRoute(fns:{
    dataBase: interface_userDB, 
    authUser: interface_authUser, createTokens: interface_createTokens, 
    createUser: interface_createUser,
    getUser: interface_getUser,
    deleteUser: interface_deleteUser,
    updateUser: interface_updateUser,
    checkUser: interface_checkUser 
    }){

    const router = Router();

    router.post('/sign-up', async (request: Request, response: Response) => {
        try{
            const user: user = request.body;
            if(Object.keys(user).length == 0) throw {statusCode: 400, message: "you must include the user data!"}

            const userId = await fns.createUser(fns.dataBase, user);
            const {token, refreshToken} = fns.createTokens(userId);

            response.header('token',token);
            response.header('refresh_token',refreshToken);
            response.sendStatus(201); // created

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    });
    
    router.post('/sign-in', async (request: Request, response: Response) => {
        try{
            const user = request.body;
            if(Object.keys(user).length == 0) throw {statusCode: 400, message: "you must include the user data!"}

            const userId = await fns.checkUser(fns.dataBase, user);
            const {token, refreshToken} = fns.createTokens(userId!);

            response.header('token',token);
            response.header('refresh_token',refreshToken);
            response.sendStatus(200); // ok

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    });

    // auth the next requests
    router.use('/', authentication(fns.authUser));

    router.get('/', async (request: Request, response: Response) => {
        try{
            const {id} = (request as any).userInfo;

            const user = await fns.getUser(fns.dataBase, id);
            if(!user) throw {statusCode: 400, message: "couldn't find any user!!"}

            response.statusCode = 200; // ok
            response.json({ status: "good" , user })

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    });

    router.patch('/', async (request: Request, response: Response) => {
        try{
            const {id} = (request as any).userInfo;
            const user = request.body;

            if(Object.keys(user).length == 0) throw {statusCode: 400, message: "you must include the user data!"}

            await fns.updateUser(fns.dataBase, id, user);

            response.sendStatus(204); // no content

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            })
        }
    });

    router.delete('/', async (request: Request, response: Response) => {
        try{
            const {id} = (request as any).userInfo;

            await fns.deleteUser(fns.dataBase, id);

            response.header('token',undefined);
            response.header('refresh_token',undefined);
            response.sendStatus(204); // no content

        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            })
        }
    });

    return router;
};
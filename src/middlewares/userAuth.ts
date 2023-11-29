import { Request, Response, NextFunction } from "express";
import { interface_authUser } from "../interfaces/services/auth/userAuth";
    
export default function authentication(authUser: interface_authUser){
    return async (request: Request, response: Response, next: NextFunction) => {
        try{
            const authToken = request.header('Authorization') || request.header('authorization');

            if(authToken && authToken.startsWith('Bearer')){

                const reqToken = authToken.split(' ')[1];
                const reqRefreshToken = request.header('refresh_token');

                const {decoded, token, refreshToken} = await authUser(reqToken, reqRefreshToken!)

                if(token != reqToken) response.header('token',token);
                if(refreshToken != reqRefreshToken) response.header('refresh_token',refreshToken);

                (request as any).userInfo = decoded;

                next();
            }else{
                response.sendStatus(401); // unAuthorized
            }
        }catch(error: any){
            if(error.error) console.error(error.error);
            response.statusCode = error.statusCode ?? 500;
            response.json({
                status: 'bad',
                message: error.message
            });
        }
    }
}
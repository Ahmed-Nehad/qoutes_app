import { Request, Response, NextFunction } from "express";
    
export default async function authentication(request: Request, response: Response, next: NextFunction){

    const {admin, pass} = request.body;

    if(!admin || !pass) {
        response.sendStatus(401);
        return;
    }

    if( admin !== process.env.ADMIN! || pass !== process.env.ADMIN_PASS!) {
        response.sendStatus(401);
        return;
    }

    next();

}
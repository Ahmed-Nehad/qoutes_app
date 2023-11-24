import { Request, Response } from "express";

export default function errorHandler(err: any, request: Request, response: Response) {
    console.error(err);
    response.statusCode = err.statusCode ?? 500;
    response.json({ 
        status: 'bad',
        message: err.message ?? "An unknown Error has occurred", 
        stackTrace: err.stack
    });
}
export const errorHandler404 = (request: Request, response: Response) => {
    response.sendStatus(404);
}
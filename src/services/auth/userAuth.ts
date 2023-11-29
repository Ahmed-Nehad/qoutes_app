import Jwt from "jsonwebtoken";
require("dotenv").config();

const Jwt_secret = process.env.jwt_secret;
const Jwt_refresh_secret = process.env.jwt_refresh_secret;

export const authUser = async (token: string, refreshToken: string) => {

    let newData = {
        decoded:{},
        token,
        refreshToken
    };

    Jwt.verify(token, Jwt_secret!, (err: any, decoded_a: any) => {
        if (!err) {
            newData = {
                decoded: decoded_a,
                token,
                refreshToken
            };
        } else {
            Jwt.verify(refreshToken, token + Jwt_refresh_secret, (err: any, decoded_b: any) => {
                if (!err) {
                    const newTokens = createTokens(decoded_b.ID);
                    newData = {
                        decoded: decoded_b,
                        token: newTokens.token,
                        refreshToken: newTokens.refreshToken
                    };
                } else {
                    throw { statusCode: 403, message: "you need to include a valid token and refresh token!" };
                }
            });
        }
    })

    return newData ?? null;
}

export const createTokens = (userId: string) => {
    const token = Jwt.sign({id: userId}, Jwt_secret!, {expiresIn:"20m"});
    const refreshToken = Jwt.sign({id: userId, token: token}, token + Jwt_refresh_secret);
    return {
        token,
        refreshToken
    }
}
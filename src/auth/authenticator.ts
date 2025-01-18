import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { SpecialKeys } from "../configs/config";


export interface JwtPayload {
    id: string;
    username: string;
    email: string;
    password: string
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload; 
    headers: {
        authorization?: string;
      };
      body: any; 
}

export const authenticateJwt = (req:AuthenticatedRequest, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SpecialKeys.SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user as JwtPayload;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}
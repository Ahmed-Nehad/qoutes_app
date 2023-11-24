import joi from "joi"
import { quotes_types, languages } from "./quotesModel";

export type quote = typeof quotes_types[number];
export type language = typeof languages[number];

export type user = {
    id:string;
    email:string;
    password:string;
    email_subs: quote[]
    language: language
} 
export const userRequestSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().alphanum().min(6).max(15).required(),
    email_subs: joi.array().items(joi.valid(...quotes_types)).default([]),
    language: joi.string().valid(...languages).default(languages[0])
})
export const userUpdateSchema = joi.object({
    email: joi.string().email(),
    password: joi.string().alphanum().min(6).max(15),
    email_subs: joi.array().items(joi.valid(...quotes_types)),
    language: joi.string().valid(...languages)
})
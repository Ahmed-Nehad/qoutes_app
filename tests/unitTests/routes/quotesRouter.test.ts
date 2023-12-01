import express from "express";
import { quotesRoute } from '../../../src/routes/quotesRoute'
import request from "supertest";
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { quotes_types } from "../../../src/models/quotesModel";

require('dotenv').config();

describe("quotes router", () => {

    const testData = {
        admin: process.env.ADMIN,
        pass: process.env.ADMIN_PASS,
        language: 'en',
        quotes: Object.fromEntries(quotes_types.map(q => [q, [`${q}1`, `${q}2`]]))
    };
    
    const quotesRouterData = {
        dataBase: {},
        addQuotes: async (db: any, id: any) => Promise.resolve(),
        addLanguage: async (db: any, id: any) => Promise.resolve()
    };

    const app = express();
    app.use(express.json());

    before(() => {
        app.use("/api/quotes/", quotesRoute(quotesRouterData as any));
    });

    describe("POST /api/quotes", () => {

        it("should add quotes to the database", async () => {

            const response = await request(app)
                .post("/api/quotes")
                .send(testData);

            assert.strictEqual(response.statusCode, 201);
        });

        it("should fail bec. no data 1", async () => {

            const response = await request(app).post("/api/quotes");

            assert.strictEqual(response.statusCode, 401);
        });

        it("should fail bec. no data 2", async () => {

            const response = await request(app)
                .post("/api/quotes")
                .send({admin: testData.admin, pass: testData.pass});

            assert.strictEqual(response.statusCode, 400);
            assert.strictEqual(response.body.status, "bad");
            assert.strictEqual(
                response.body.message,
                "you must include quotes as object"
            );
        });

        it("should fail bec. no data 3", async () => {

            const response = await request(app)
                .post("/api/quotes")
                .send({
                    admin: testData.admin,
                    pass: testData.pass,
                    quotes: testData.quotes
                });

            assert.strictEqual(response.statusCode, 400);
            assert.strictEqual(response.body.status, "bad");
            assert.strictEqual(
                response.body.message,
                "you must include language as string"
            );
        });

        it("should fail due internal error", async (t) => {

            t.mock.method(quotesRouterData, "addQuotes", async () =>
                Promise.reject({
                    statusCode: 500,
                    message: "An unknown Error has occurred",
                })
            );

            const response = await request(app)
                .post("/api/quotes")
                .send(testData);

            assert.strictEqual(response.statusCode, 500);
            assert.strictEqual(response.body.status, "bad");
            assert.strictEqual(response.body.message,"An unknown Error has occurred");
        });
    });

    describe("POST /api/quotes/language", () => {

        it("should sign in and return tokens", async () => {

            const response = await request(app)
                .post("/api/quotes/language")
                .send(testData);

            assert.strictEqual(response.statusCode, 201);
        });

        it("should fail bec. no data 1", async () => {

            const response = await request(app).post("/api/quotes/language");

            assert.strictEqual(response.statusCode, 401);
        });

        it("should fail bec. no data 2", async () => {

            const response = await request(app)
                .post("/api/quotes/language")
                .send({admin: testData.admin, pass: testData.pass});

            assert.strictEqual(response.statusCode, 400);
            assert.strictEqual(response.body.status, "bad");
            assert.strictEqual(
                response.body.message,
                "you must include language as string"
            );
        });

        it("should fail due internal error", async (t) => {

            t.mock.method(quotesRouterData, "addLanguage", async () =>
                Promise.reject({
                    statusCode: 500,
                    message: "An unknown Error has occurred",
                })
            );

            const response = await request(app)
                .post("/api/quotes/language")
                .send(testData);

            assert.strictEqual(response.statusCode, 500);
            assert.strictEqual(response.body.status, "bad");
            assert.strictEqual(response.body.message,"An unknown Error has occurred");
        });
    });
});

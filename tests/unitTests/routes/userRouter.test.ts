import express from "express";
import { userRouter } from "../../../src/routes/userRouter";
import request from "supertest";
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { languages, quotes_types } from "../../../src/models/quotesModel";

describe("user router", () => {
    const testData = {
        id: "12345678",
        email: "test@email.com",
        password: "password",
        email_subs: [quotes_types[0], quotes_types[1]],
        language: languages[0],
        token: "token",
        refresh_token: "refreshToken",
    };
    const userRouterData = {
        dataBase: {},
        authUser: async (token: string, refreshToken: string) =>
            Promise.resolve({
                decoded: { id: testData.id },
                token: testData.token,
                refreshToken: testData.refresh_token,
            }),
        createTokens: (userId: string) => (
         { token: testData.token, refreshToken: testData.refresh_token }
        ),
        createUser: async (db: any, user: any) => Promise.resolve(testData.id),
        getUser: async (db: any, id: any, data: any) =>
            Promise.resolve({
                email: testData.email,
                email_subs: testData.email_subs,
                language: testData.language,
            }),
        updateUser: async (db: any, id: any) => Promise.resolve(),
        deleteUser: async (db: any, id: any) => Promise.resolve(),
        checkUser: async (db: any, id: any) => Promise.resolve(testData.id)
    };

    const app = express();
    app.use(express.json());

    before(() => {
        app.use("/api/users", userRouter(userRouterData as any));
    });

    describe("auth", () => {
        const user = { email: testData.email, password: testData.password };

        describe("POST /api/users/sign-up", () => {

            it("should sign up and return tokens", async () => {
                const response = await request(app)
                    .post("/api/users/sign-up")
                    .send(user);

                assert.strictEqual(response.statusCode, 201);
                assert.strictEqual(response.header["token"], "token");
                assert.strictEqual(response.header["refresh_token"], "refreshToken");
            });

            it("should fail bec. no data", async () => {
                const response = await request(app).post("/api/users/sign-up");

                assert.strictEqual(response.statusCode, 400);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(
                    response.body.message,
                    "you must include the user data!"
                );
            });

            it("should fail due internal error", async (t) => {
                t.mock.method(userRouterData, "createUser", async () =>
                    Promise.reject({
                        statusCode: 500,
                        message: "An unknown Error has occurred",
                    })
                );

                const response = await request(app)
                    .post("/api/users/sign-up")
                    .send(user);

                assert.strictEqual(response.statusCode, 500);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message,"An unknown Error has occurred");
            });
        });

        describe("POST /api/users/sign-in", () => {

            it("should sign in and return tokens", async () => {
                const response = await request(app)
                    .post("/api/users/sign-in")
                    .send(user);

                assert.strictEqual(response.statusCode, 200);
                assert.strictEqual(response.header["token"], "token");
                assert.strictEqual(response.header["refresh_token"], "refreshToken");
            });

            it("should fail bec. no data", async () => {
                const response = await request(app).post("/api/users/sign-in");

                assert.strictEqual(response.statusCode, 400);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message, "you must include the user data!");
            });

            it("should fail due internal error", async (t) => {
                t.mock.method(userRouterData, "checkUser", async () =>
                    Promise.reject({
                        statusCode: 500,
                        message: "An unknown Error has occurred",
                    })
                );

                const response = await request(app)
                    .post("/api/users/sign-in")
                    .send(user);

                assert.strictEqual(response.statusCode, 500);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message,"An unknown Error has occurred");
            });
        });
    });

    describe("RUD operations with token", () => {

        it("should fail bec. no tokens", async () => {
            const response = await request(app).get("/api/users");

            assert.strictEqual(response.statusCode, 401);
        });

        describe("Get /api/users", () => {

            it("should return my user", async () => {
                const response = await request(app)
                    .get("/api/users")
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 200);
                assert.strictEqual(response.body.status, "good");
                assert.deepStrictEqual(response.body.user, {
                    email: testData.email,
                    email_subs: testData.email_subs,
                    language: testData.language,
                });
            });

            it("should fail due internal error", async (t) => {
                t.mock.method(userRouterData, "getUser", async () =>
                    Promise.reject({
                        statusCode: 500,
                        message: "An unknown Error has occurred",
                    })
                );

                const response = await request(app).get("/api/users")
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 500);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message,"An unknown Error has occurred");
            });
        });

        describe("PATCH /api/users", () => {

            it("should update my user", async () => {
                const response = await request(app).patch("/api/users")
                    .send({ email: testData.email })
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 204);
            });

            it("should fail due internal error", async (t) => {
                t.mock.method(userRouterData, "updateUser", async () =>
                    Promise.reject({
                        statusCode: 500,
                        message: "An unknown Error has occurred",
                    })
                );

                const response = await request(app).patch("/api/users")
                    .send({ email: testData.email })
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 500);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message,"An unknown Error has occurred");
            });
        });
        describe("DELETE /api/users", () => {

            it("should delete my user", async () => {
                const response = await request(app).delete("/api/users")
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 204);
            });

            it("should fail due internal error", async (t) => {
                t.mock.method(userRouterData, "deleteUser", async () =>
                    Promise.reject({
                        statusCode: 500,
                        message: "An unknown Error has occurred",
                    })
                );

                const response = await request(app).delete("/api/users")
                    .set("authorization", `Bearer ${testData.token}`)
                    .set("refresh_token", testData.refresh_token);

                assert.strictEqual(response.statusCode, 500);
                assert.strictEqual(response.body.status, "bad");
                assert.strictEqual(response.body.message,"An unknown Error has occurred");
            });
        });
    });
});

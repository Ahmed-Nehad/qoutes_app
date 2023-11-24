import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createUser } from "../../../../src/controllers/userController/createUser";

describe('create user controller', () => {
    const testData = {
        email: 'test@email.com',
        password: 'password',
        id: '12345678',
        dataBase: {
            createUser: async (user: object) => Promise.resolve()
        }
    }

    it('should create the user and return the id', async () => {
        const user = {email: testData.email, password: testData.password};
        const id = await createUser(testData.dataBase as any, user as any);

        assert.strictEqual(typeof id, 'string');
        assert.strictEqual(id.length, 8);
    });

    it('should fail bec. bad user data', async () => {
        const user = {password: testData.password};
        try{
            await createUser(testData.dataBase as any, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 400);
            assert.notStrictEqual((error as any).message, undefined);
        }
    });

    it('should fail due internal error', async (t) => {
        const user = {email: testData.email, password: testData.password};
        t.mock.method(testData.dataBase, 'createUser', () => Promise.reject('error'))

        try{
            await createUser(testData.dataBase as any, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while creating the user');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
import { checkUser } from "../../../../src/controllers/userController/checkUser";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from 'bcrypt';

describe('check user controller', () => {
    const testData = {
        email: 'test@email.com',
        password: 'password',
        id: '12345678',
        dataBase: {
            getUserBy: async (name: string, value: string) => Promise.resolve(
                {id: testData.id, email: value, password: await bcrypt.hash(testData.password, 10)})
        }
    }

    it('should check the user and return the id', async (t) => {
        const user = {email: testData.email, password: testData.password};
        const id = await checkUser(testData.dataBase as any, user as any);

        assert.strictEqual(id, '12345678');
    });

    it('should fail bec. bad user data', async (t) => {
        const user = {password: testData.password};
        try{
            await checkUser(testData.dataBase as any, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 400);
            assert.notStrictEqual((error as any).message, undefined);
        }
    });

    it('should fail bec. bad password', async (t) => {
        const user = {email: testData.email, password: 'wrongPassword'};
        try{
            await checkUser(testData.dataBase as any, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 404);
            assert.strictEqual((error as any).message, `could't find any user with this data!`);
        }
    });

    it('should fail due internal error', async (t) => {
        const user = {email: testData.email, password: testData.password};
        t.mock.method(testData.dataBase, 'getUserBy', () => Promise.reject('error'))

        try{
            await checkUser(testData.dataBase as any, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while reading the data');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
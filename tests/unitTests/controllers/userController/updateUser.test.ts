import { updateUser } from "../../../../src/controllers/userController/updateUser";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from 'bcrypt';

describe('update user controller', () => {
    const testData = {
        email: 'test@email.com',
        password: 'password',
        id: '12345678',
        dataBase: {
            getUser: async (id: string) => Promise.resolve(
                {id: id, email: testData.email, password: await bcrypt.hash(testData.password, 10)}
            ),
            updateUser: async (id: string, data: object) => Promise.resolve()
        }
    }

    it('should update the user', async () => {
        const user = {email: testData.email, password: testData.password};
        await updateUser(testData.dataBase as any, testData.id, user as any);
    });

    it('should fail bec. bad user data', async (t) => {
        const user = {password: testData.password};
        try{
            await updateUser(testData.dataBase as any, testData.id, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 400);
            assert.notStrictEqual((error as any).message, undefined);
        }
    });

    it('should fail due internal error', async (t) => {
        const user = {email: testData.email, password: testData.password};
        t.mock.method(testData.dataBase, 'getUser', () => Promise.reject('error'))

        try{
            await updateUser(testData.dataBase as any, testData.id, user as any);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while updating the user');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
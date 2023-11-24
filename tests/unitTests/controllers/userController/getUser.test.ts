import { getUser } from "../../../../src/controllers/userController/getUser";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { languages } from "../../../../src/models/quotesModel";

describe('get user controller', () => {
    const testData = {
        email: 'test@email.com',
        password: 'password',
        id: '12345678',
        dataBase: {
            getUser: async (id: string) => Promise.resolve({
                id: id, email: testData.email, email_subs: [], language:languages[0]
            })
        }
    }

    it('should return the user', async (t) => {
        const user = await getUser(testData.dataBase as any, testData.id);

        assert.deepStrictEqual(user,{
            email: testData.email, email_subs: [], language:languages[0]
        })
    });

    it('should fail due internal error', async (t) => {
        t.mock.method(testData.dataBase, 'getUser', () => Promise.reject('error'))

        try{
            await getUser(testData.dataBase as any, testData.id);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while reading the data');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
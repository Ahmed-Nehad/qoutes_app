import { deleteUser } from "../../../../src/controllers/userController/deleteUser";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe('delete user controller', () => {
    const testData = {
        id: '12345678',
        dataBase: {
            deleteUser: async (id: string) => Promise.resolve()
        }
    }

    it('should delete the user', async (t) => {
        await deleteUser(testData.dataBase as any, testData.id);
    });

    it('should fail due internal error', async (t) => {
        t.mock.method(testData.dataBase, 'deleteUser', () => Promise.reject('error'))

        try{
            await deleteUser(testData.dataBase as any, testData.id);
        }catch(error){
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while deleting the user');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
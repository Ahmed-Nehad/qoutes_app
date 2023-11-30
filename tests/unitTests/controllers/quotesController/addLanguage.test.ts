import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addLanguage } from '../../../../src/controllers/quotesController/addLanguage';
import { languages } from "../../../../src/models/quotesModel";

describe('Add new language from the Quotes controller', () => {

    const databaseTest = {
        addNewLanguage: async (language: any) => Promise.resolve()
    }
    
    it('should add new language', async (t) => {

        const fn = t.mock.method(databaseTest, 'addNewLanguage');
        
        const testLanguage = 'test';

        await addLanguage(databaseTest as any, testLanguage);

        assert.strictEqual(fn.mock.callCount(), 1);
        assert.deepStrictEqual(fn.mock.calls[0].arguments, [testLanguage]);
        assert.ok(languages.includes(testLanguage));
        assert.strictEqual(languages.pop(), testLanguage);
    });

    it('should fail bec. language already exist', async (t) => {

        const fn = t.mock.method(databaseTest, 'addNewLanguage');
        
        const testLanguage = languages[0];
        
        try{ await addLanguage(databaseTest as any, testLanguage); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 0);
            assert.strictEqual((error as any).statusCode, 409);
            assert.strictEqual((error as any).message,  `This language "${testLanguage}" already exist. `);
        }
    });

    it('should fail due database error', async (t) => {

        const testError = 'error';

        const fn = t.mock.method(databaseTest, 'addNewLanguage', () => Promise.reject(testError));
        
        try{ await addLanguage(databaseTest as any, 'foo'); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 1);
            assert.deepStrictEqual(fn.mock.calls[0].arguments, ['foo']);
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, 'An unknown Error has occurred while creating the data');
            assert.strictEqual((error as any).error, 'error');
        }
    });
});
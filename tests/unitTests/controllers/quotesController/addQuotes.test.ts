// import { interface_addQuotes } from "../../interfaces/controllers/quotesController/addQuotes";
// import interface_quotesDB from "../../interfaces/repositories/quotesDB";
// import { language } from "../../models/userModel";
// import { languages, quotes_types } from "../../models/quotesModel";

// export const addQuotes: interface_addQuotes = async (database: interface_quotesDB, language: language, quotes: { [x: string]: string[]; }) => {
//     try{
//         if(!languages.includes(language)) throw {statusCode: 400, message: `The specified "language": "${language}" isn't avilable. You can add a new language if you want`}

//         if( quotes_types !== Object.keys(quotes)) throw {statusCode: 400, message: `The specified "quotes" must have these keys "${quotes_types}". `}

//         Object.values(quotes).forEach(q => { 
//             if (!Array.isArray(q))  throw {statusCode: 400, message: `The specified "quotes" must have string arrays for all the values. `}
//         })

//         await database.addQuotes(language, quotes);
//     }catch(error: any){
//         throw error.statusCode ? error : {statusCode: 500, message: "An unknown Error has occurred while creating the data", error}
//     }
// }

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addQuotes } from '../../../../src/controllers/quotesController/addQuotes';
import { languages, quotes_types } from "../../../../src/models/quotesModel";

describe('Add quotes from the Quotes controller', () => {

    const databaseTest = {
        addQuotes: async (language: any, quotees: any) => Promise.resolve()
    }
    
    it('should add quotes', async (t) => {

        const fn = t.mock.method(databaseTest, 'addQuotes');
        
        const testLanguage = languages[0];
        const testQuotes = Object.fromEntries(quotes_types.map(q => [q, []]));

        await addQuotes(databaseTest as any, testLanguage, testQuotes);

        assert.strictEqual(fn.mock.callCount(), 1);
        assert.deepStrictEqual(fn.mock.calls[0].arguments, [testLanguage, testQuotes]);
    });

    it('should fail bec. language not exists', async (t) => {

        const fn = t.mock.method(databaseTest, 'addQuotes');
        
        const testLanguage = 'foo';
        const testQuotes = Object.fromEntries(quotes_types.map(q => [q, []]));
        
        try{ await addQuotes(databaseTest as any, testLanguage, testQuotes); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 0);
            assert.strictEqual((error as any).statusCode, 400);
            assert.strictEqual((error as any).message, `The specified "language": "${testLanguage}" isn't avilable. You can add a new language if you want`);
        }
    });
    

    it('should fail bec. quotes is in bad format 1', async (t) => {

        const fn = t.mock.method(databaseTest, 'addQuotes');
        
        const testLanguage = languages[0];
        const testQuotes = Object.fromEntries(quotes_types.map(q => [q, ''])) as any;
        
        try{ await addQuotes(databaseTest as any, testLanguage, testQuotes); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 0);
            assert.strictEqual((error as any).statusCode, 400);
            assert.strictEqual((error as any).message, `The specified "quotes" must have string arrays for all the values. `);
        }
    });

    it('should fail bec. quotes is in bad format 2', async (t) => {

        const fn = t.mock.method(databaseTest, 'addQuotes');
        
        const testLanguage = languages[0];
        const testQuotes = {foo: 'bar'} as any;
        
        try{ await addQuotes(databaseTest as any, testLanguage, testQuotes); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 0);
            assert.strictEqual((error as any).statusCode, 400);
            assert.strictEqual((error as any).message, `The specified "quotes" must have these keys "${quotes_types}". `);
        }
    });

    it('should fail bec. quotes is in bad format', async (t) => {

        const fn = t.mock.method(databaseTest, 'addQuotes', () => Promise.reject('error'));
        
        const testLanguage = languages[0];
        const testQuotes = Object.fromEntries(quotes_types.map(q => [q, []]));
        
        try{ await addQuotes(databaseTest as any, testLanguage, testQuotes); }
        catch(error){

            assert.strictEqual(fn.mock.callCount(), 1);
            assert.deepStrictEqual(fn.mock.calls[0].arguments, [testLanguage, testQuotes]);
            assert.strictEqual((error as any).statusCode, 500);
            assert.strictEqual((error as any).message, `An unknown Error has occurred while creating the data`);
            assert.strictEqual((error as any).error, `error`);
        }
    });
});
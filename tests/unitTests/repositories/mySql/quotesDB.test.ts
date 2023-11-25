import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QuotesDB from '../../../../src/repositories/mySql/quotesDB';

describe('quotesDB test', () => {

    const testData = {
        quotes: {'silly': ['silly1', 'silly2'], 'wise': ['wise1', 'wise2']},
        pool: { execute: async (s:string) => Promise.resolve() }
    }
    
    const quotesDB = new QuotesDB(testData.pool as any);

    it('should return the quote', async (t) => {

        const fn = t.mock.method(testData.pool, 'execute', 
            () => Promise.resolve([[{'foo': 'quote'}], 'data'])
        );

        const quote  = await quotesDB.getQuoteById('en', 1, 'proverb', 0);

        assert.strictEqual(quote, 'quote');
        assert.strictEqual(fn.mock.calls.length, 1);
        assert.strictEqual(fn.mock.calls[0].arguments.length, 1);
        assert.match(fn.mock.calls[0].arguments.at(0)! as string,
        /^select proverb->'\$\[0\]' from [a-zA-Z_]+en where id = '1'$/);
    });

    it('should add quotes', async (t) => {

        const fn = t.mock.method(testData.pool, 'execute');

        await quotesDB.addQuotes('en', testData.quotes);

        assert.strictEqual(fn.mock.calls.length, 1);
        assert.strictEqual(fn.mock.calls[0].arguments.length, 1);
        assert.match(fn.mock.calls[0].arguments.at(0)! as string,
        /^insert into [a-zA-Z_]+ values \('\["silly1","silly2"\]','\["wise1","wise2"\]'\)$/);
    });

    it('should add new language', async (t) => {

        const fn = t.mock.method(testData.pool, 'execute');

        await quotesDB.addNewLanguage('en');

        assert.strictEqual(fn.mock.calls.length, 1);
        assert.strictEqual(fn.mock.calls[0].arguments.length, 1);
        assert.match(fn.mock.calls[0].arguments.at(0)! as string,
        /^CREATE TABLE `[a-zA-z_]+`\.`[a-zA-z_]+` \(\n\s*`id` INT NOT NULL AUTO_INCREMENT,\n\s*(`[a-zA-z]+` JSON NOT NULL,)+\n\s*UNIQUE INDEX `id_UNIQUE` \(`id` ASC\) VISIBLE,\n\s*PRIMARY KEY \(`id`\)\);$/);
    });
});
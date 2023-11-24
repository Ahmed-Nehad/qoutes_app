import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import QuotesDB from '../../../../src/repositories/mySql/quotesDB';

describe('quotesDB test', () => {
    const testData = {
        pool: { execute: async (s:string) => Promise.resolve([[{'foo': 'quote'}], 'data']) }
    }
    
    const quotesDB = new QuotesDB(testData.pool as any);

    it('should return the quote', async (t) => {
        const fn = mock.method(testData.pool, 'execute');

        const quote  = await quotesDB.getQuoteById('en', 1, 'proverb', 0);

        assert.strictEqual(quote, 'quote');
        assert.strictEqual(fn.mock.calls.length, 1);
        assert.strictEqual(fn.mock.calls[0].arguments.length, 1);
        assert.match(fn.mock.calls[0].arguments.at(0)! as string,/^select proverb->'\$\[0\]' from .+en where id = '1'$/);
    });
});
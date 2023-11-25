import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import UserDB from "../../../../src/repositories/mySql/userDB";

describe('userDB test', () => {
    const testData = {
        user: {
            id:'12345678',
            email:'test@email.com',
            password:'password'
        },
        pool: { execute: async (s:string) => Promise.resolve() }
    }

    const fn = mock.method(testData.pool, 'execute');
    
    const userDB = new UserDB(testData.pool as any);

    it('should create a new user', async (t) => {
        await userDB.createUser(testData.user as any);

        assert.strictEqual(fn.mock.calls.length, 1);
        assert.strictEqual(fn.mock.calls[0].arguments.length, 1);
        assert.match(fn.mock.calls[0].arguments.at(0)! as string, 
        /insert into [a-zA-Z]+ values \('12345678','test@email\.com','password'\)/)
    });

    it('should get all the users', async (t) => {
        const testUsersData = [
            {email:'email_1', password:'pass_1'},
            {email:'email_2', password:'pass_2'}
        ];

        fn.mock.mockImplementationOnce(async (s:string) => Promise.resolve([testUsersData, 'data']))

        const users = await userDB.getAllUsers();

        assert.deepStrictEqual(users, testUsersData);
        assert.strictEqual(fn.mock.calls.length, 2);
        assert.strictEqual(fn.mock.calls[1].arguments.length, 1);
        assert.match(fn.mock.calls[1].arguments.at(0)! as string, /^select \* from [a-zA-Z]+$/)
    });

    it('should get the user by id', async (t) => {
        const testUserData = [testData.user];

        fn.mock.mockImplementationOnce(async (s:string) => Promise.resolve([testUserData, 'data']))

        const user  = await userDB.getUser(testData.user.id);

        assert.deepStrictEqual(user, testUserData[0]);
        assert.strictEqual(fn.mock.calls.length, 3);
        assert.strictEqual(fn.mock.calls[2].arguments.length, 1);
        assert.match(fn.mock.calls[2].arguments.at(0)! as string, 
        /^select \* from [a-zA-Z]+ where id = '12345678'$/)
    });

    it('should get the user by table name (email)', async (t) => {
        const testUserData = [testData.user];

        fn.mock.mockImplementationOnce(async (s:string) => Promise.resolve([testUserData, 'data']))

        const user = await userDB.getUserBy('email', testData.user.email);

        assert.deepStrictEqual(user, testUserData[0]);
        assert.strictEqual(fn.mock.calls.length, 4);
        assert.strictEqual(fn.mock.calls[3].arguments.length, 1);
        assert.match(fn.mock.calls[3].arguments.at(0)! as string, 
        /^select \* from [a-zA-Z]+ where email = 'test@email\.com'$/)
    });

    it('should update the user', async (t) => {
        await userDB.updateUser(testData.user.id, {email:'new@email.com'});

        assert.strictEqual(fn.mock.calls.length, 5);
        assert.strictEqual(fn.mock.calls[4].arguments.length, 1);
        assert.match(fn.mock.calls[4].arguments.at(0)! as string, 
        /^update [a-zA-Z]+ set email = 'new@email\.com' where id = '12345678'$/)
    });

    it('should delete the user', async (t) => {
        await userDB.deleteUser(testData.user.id);

        assert.strictEqual(fn.mock.calls.length, 6);
        assert.strictEqual(fn.mock.calls[5].arguments.length, 1);
        assert.match(fn.mock.calls[5].arguments.at(0)! as string, 
        /^delete from [a-zA-Z]+ where id = '12345678'$/)
    });
});
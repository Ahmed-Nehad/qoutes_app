import app from '../../src/main';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { user } from '../../src/models/userModel';
require('dotenv').config();

const port = process.env.PORT;
const server = app.listen(port,() => console.log(`started the test server on http://localhost:${port}`));

const usersApiUrl = `http://localhost:${port}/api/v1/users`;

describe('api test', () => {

    describe('user api', () => {

        const testUser: user = {email: 'test@email.com', password: 'password'} as any;
        const updatedUser: user = {email: 'newTest@email.com', password: 'newPassword'} as any;
        let token: string;
        let refresh_token: string;

        const getUser = async (token: string, refresh_token: string) => {
            const response = await fetch(usersApiUrl, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token}`,
                    'refresh-token': refresh_token
                }
            });
            const responseBody = await response.json();
        
            return {
                response,
                responseBody
            }
        }

        it('should create an account and return tokens', async () => {

            const body = testUser;

            const response = await fetch(`${usersApiUrl}/sign-up`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });

            assert.strictEqual(response.status, 201);
            assert.ok(response.headers.get('token'));
            assert.ok(response.headers.get('refresh_token'));
        });

        it('should sign in with the new user', async () => {

            const body = testUser;

            const response = await fetch(`${usersApiUrl}/sign-in`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'}
            });

            assert.strictEqual(response.status, 200);
            assert.ok(response.headers.get('token'));
            assert.ok(response.headers.get('refresh_token'));

            token = response.headers.get('token')!;
            refresh_token = response.headers.get('refresh_token')!;
        });

        describe('using tokens', () => {

            it('should get the user', async (t) => {

                const {response, responseBody} = await getUser(token, refresh_token);
        
                assert.strictEqual(response.status, 200);
                assert.strictEqual(responseBody.status, 'good');
                assert.strictEqual(responseBody.user.email, testUser.email);
                assert.ok(responseBody.user.email_subs);
                assert.ok(responseBody.user.language);
            });
        
            it('should update the user', async (t) => {

                const body = updatedUser;
                const UpdateResponse = await fetch(usersApiUrl, {
                    method: 'PATCH',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`,
                        'refresh-token': refresh_token
                    }
                });
        
                assert.strictEqual(UpdateResponse.status, 204);

                // get the user to check if it is updated
                const {response, responseBody} = await getUser(token, refresh_token);
        
                assert.strictEqual(response.status, 200);
                assert.strictEqual(responseBody.status, 'good');
                assert.strictEqual(responseBody.user.email, updatedUser.email);
            });
        
            it('should delete the user', async () => {

                const deleteResponse = await fetch(usersApiUrl, {
                    method: 'DELETE',
                    headers: {
                        'authorization': `Bearer ${token}`,
                        'refresh-token': refresh_token
                    }
                });
        
                assert.strictEqual(deleteResponse.status, 204);
            });
        });

        describe('failing tests', () => {

            it('not found error', async () => {

                const response = await fetch(`http://localhost:${port}/foo/bar`, {
                    method: 'GET'
                });

                assert.strictEqual(response.status, 404);
            });

            describe('CRUD operations errors', () => {

                it('crete a user to test the CRUD operations', async () => {

                    const body = testUser;

                    const response = await fetch(`${usersApiUrl}/sign-up`, {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }
                    });
            
                    assert.strictEqual(response.status, 201);
                    assert.ok(response.headers.get('token'));
                    assert.ok(response.headers.get('refresh_token'));

                    token = response.headers.get('token')!;
                    refresh_token = response.headers.get('refresh_token')!;
                });

                describe('POST errors', () => {

                    describe('sign up', () => {

                        it('no data', async () => {

                            const response = await fetch(`${usersApiUrl}/sign-up`, {
                                method: 'POST'
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, 'you must include the user data!');
                        });
        
                        it('wrong data types 1', async () => {
        
                            const body = {email: 'foo', password: 'bar'};
            
                            const response = await fetch(`${usersApiUrl}/sign-up`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, '"email" must be a valid email');
                        });
        
                        it('wrong data types 2', async () => {
        
                            const body = {foo: 'test@email.com', bar: 'password'};
            
                            const response = await fetch(`${usersApiUrl}/sign-up`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, '"email" is required');
                        });
        
                        it('email already exist', async () => {
        
                            // email already exist as we created the test user again in line 125
                            const body = testUser; 
            
                            const response = await fetch(`${usersApiUrl}/sign-up`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, 'This email is already in use!');
                        });
                    });

                    describe('sign in', () => {

                        it('no data', async () => {

                            const response = await fetch(`${usersApiUrl}/sign-in`, {
                                method: 'POST'
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, 'you must include the user data!');
                        });
        
                        it('wrong data types 1', async () => {
        
                            const body = {email: 'foo', password: 'bar'};
            
                            const response = await fetch(`${usersApiUrl}/sign-in`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, '"email" must be a valid email');
                        });
        
                        it('wrong data types 2', async () => {
        
                            const body = {foo: 'test@email.com', bar: 'password'};
            
                            const response = await fetch(`${usersApiUrl}/sign-in`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 400);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, '"email" is required');
                        });
        
                        it('email not exist', async () => {

                            const body = {email:'foo@email.com', password:'password'}; 
            
                            const response = await fetch(`${usersApiUrl}/sign-in`, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const responseBody = await response.json();
                    
                            assert.strictEqual(response.status, 404);
                            assert.strictEqual(responseBody.status, 'bad');
                            assert.strictEqual(responseBody.message, "could't find any user with this data!");
                        });
                    });
                });

                describe('PATCH errors', () => {

                    it('no tokens', async () => {

                        const body = updatedUser;
                        const response = await fetch(usersApiUrl, {
                            method: 'PATCH',
                            body: JSON.stringify(body),
                            headers: { 'Content-Type': 'application/json' }
                        });

                        assert.strictEqual(response.status, 401);
                    });

                    it('no data', async () => {

                        const response = await fetch(usersApiUrl, {
                            method: 'PATCH',
                            headers: {
                                'authorization': `Bearer ${token}`,
                                'refresh-token': refresh_token
                            }
                        });
                        const responseBody = await response.json();

                        assert.strictEqual(response.status, 400);
                        assert.strictEqual(responseBody.status, 'bad');
                        assert.strictEqual(responseBody.message, 'you must include the user data!');
                    });

                    it('wrong data types 1', async () => {

                        const body = {email: 'foo', password: 'bar'};
        
                        const response = await fetch(usersApiUrl, {
                            method: 'PATCH',
                            body: JSON.stringify(body),
                            headers: { 
                                'Content-Type': 'application/json',
                                'authorization': `Bearer ${token}`,
                                'refresh-token': refresh_token
                            }
                        });
                        const responseBody = await response.json();
                
                        assert.strictEqual(response.status, 400);
                        assert.strictEqual(responseBody.status, 'bad');
                        assert.strictEqual(responseBody.message, '"email" must be a valid email');
                    });

                    it('wrong data types 2', async () => {

                        const body = {foo: 'test@email.com', bar: 'password'};
        
                        const response = await fetch(usersApiUrl, {
                            method: 'PATCH',
                            body: JSON.stringify(body),
                            headers: { 
                                'Content-Type': 'application/json',
                                'authorization': `Bearer ${token}`,
                                'refresh-token': refresh_token
                            }
                        });
                        const responseBody = await response.json();
                
                        assert.strictEqual(response.status, 400);
                        assert.strictEqual(responseBody.status, 'bad');
                        assert.strictEqual(responseBody.message, '"foo" is not allowed');
                    });
                });

                describe('GET errors', () => {

                    it('no tokens', async () => {

                        const {response, responseBody} = await getUser('', '');
        
                        assert.strictEqual(response.status, 401);
                    });

                    it('should delete the user then try to GET it', async () => {

                        const deleteResponse = await fetch(usersApiUrl, {
                            method: 'DELETE',
                            headers: {
                                'authorization': `Bearer ${token}`,
                                'refresh-token': refresh_token
                            }
                        });
                
                        assert.strictEqual(deleteResponse.status, 204);
            
                        const {response, responseBody} = await getUser(token, refresh_token);
            
                        assert.strictEqual(response.status, 400);
                        assert.strictEqual(responseBody.status, 'bad');
                        assert.strictEqual(responseBody.message, "couldn't find any user!!");
                    });
                });
            });
        });
    });

    after(() => {
        server.close(() => {console.log('closed the test server')});
    });
});
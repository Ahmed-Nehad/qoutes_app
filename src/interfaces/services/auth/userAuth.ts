export type interface_authUser = (token: string, refreshToken: string) => Promise<{
    decoded: {};
    token: string;
    refreshToken: string;
}>

export type interface_createTokens =  (userId: string) => {
    token: string;
    refreshToken: string;
}
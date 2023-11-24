import { user } from "../../models/userModel";

export default interface interface_userDB {
    createUser (user: user): Promise<void> ;
    getAllUsers(): Promise<user[]> ;
    getUser(id: user['id']): Promise<user | null> ;
    getUserBy (tableName: String, value: any): Promise<user | null>;
    updateUser (id: user['id'], data: object): Promise<void>;
    deleteUser (id: user['id']): Promise<void>;
}
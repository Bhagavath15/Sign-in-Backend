import { client } from '../index.js';

export async function hashpass(username, hashpassword) {
    return await client
        .db("login")
        .collection("signup")
        .insertOne({
            username: username,
            password: hashpassword
        });
}

export async function getuserbyname(username, hashpassword) {
    return await client
        .db("login")
        .collection("signup")
        .findOne({
            username: username
        });
}
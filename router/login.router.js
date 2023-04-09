import express from "express";
import { getuserbyname, hashpass } from "../service/createuser.service.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const router = express.Router()

export async function genhashpassword(password) {
    const no_of_rounds = 10
    const salt = await bcrypt.genSalt(no_of_rounds)
    const hashPassword = await bcrypt.hash(password, salt)
    return hashPassword
}

router.post("/login", async function (request, response) {
    const { username, password } = request.body;
    const userfromdb = await getuserbyname(username)
    console.log(userfromdb)

    if (!userfromdb) {
        response.status(400).send({ message: "invalid credential" })
    }
    else {
        const storedpassword = userfromdb.password
        const ispasswordcheck = await bcrypt.compare(password, storedpassword)
        console.log(ispasswordcheck)
        if (ispasswordcheck) {
            const token = Jwt.sign({ id: userfromdb._id }, process.env.SECRET_KEY)
            response.send({ message: "login successful", token: token })

        }
        else {
            response.status(400).send({ messaage: "invalid credentials" })
        }
    }
});

router.post("/signup", async function (request, response) {
    const { username, password } = request.body;

    const userfromdb = await getuserbyname(username)

    // console.log(userfromdb);

    if (userfromdb) {
        response.status(400).send({ message: "user name already exist" })
    }
    else if (password.length < 8) {
        response.status(400).send({ message: "password must be atleast 8 char" })
    }
    else {

        const hashpassword = await genhashpassword(password)
        // console.log(data);

        // db.userid.insertmany(data)
        const result = await hashpass(username, hashpassword)
        response.send(result);
    }

});

export default router
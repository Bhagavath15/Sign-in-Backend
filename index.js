import express from "express"; // "type": "module"
import bodyParser from "body-parser";
import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import cors from "cors";
import signinRouter from './router/login.router.js';
import emailRouter from './router/route.js';
import { auth } from "./middleware/auth.js";


// import bcrypt   from ' bcrypt'
dotenv.config()
export const app = express();

const PORT = process.env.PORT;

const MONGO_URL = (process.env.MONGO_URL)
export const client = new MongoClient(MONGO_URL);
await client.connect();
console.log('mongo is connected!!');


app.use(cors())
app.use(express.json())

// Use bodyParser middleware to parse JSON in request body
app.use(bodyParser.json());

app.get("/", function (request, response) {

    response.send("🙋‍♂️, 🌏 🎊✨🤩");

});


app.use("/", signinRouter);
app.use("/", emailRouter);

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
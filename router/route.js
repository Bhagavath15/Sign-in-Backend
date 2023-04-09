import express from "express";
import nodemailer from 'nodemailer'
import randomstring from 'randomstring'
import * as dotenv from 'dotenv'
import { client } from '../index.js';
import { genhashpassword } from "./login.router.js";

const router = express.Router()
dotenv.config()

router.post("/dashboard/:id", function (request, response) {
    const { email, remainder, loanType } = request.body
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Hey there!  ${remainder} only to payment for ${loanType}`,
            html: `<h2>hello</h2>
            <p>I hope that you are well.
            I just want to let you know that ${remainder} only left 
            to complete your payment for your ${loanType}.
             </p>
            <p>Thank you</p>`

        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            }
            else {
                console.log(info.response)
                response.status(201).json({ status: 201, info })
            }
        })
    }
    catch (error) {
        response.status(401).json({ status: 401, error })
    }
})

router.post("/forget-password", async (req, res) => {
    const { email } = req.body;

    const otp = randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
    const user = await client
        .db("login")
        .collection("signup")
        .updateOne({
            username: email
        }, { $set: { otp } })
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Reset your password",
            text: `OTP for change your password is:${otp}`,//Click the link to reset your password: http://localhost:4004/reset-password
        });
        res.send("OTP send successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Verify OTP
router.post('/verifyotp', async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        // Verify OTP
        const user = await client
            .db("login")
            .collection("signup")
            .findOne({ username: email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Hash password
        // Update password and OTP
        const hashpassword = await genhashpassword(password)
        const users = await client
            .db("login")
            .collection("signup")
            .updateOne({ username: email }, { $set: { password: hashpassword, otp: '' } })

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
});

export default router
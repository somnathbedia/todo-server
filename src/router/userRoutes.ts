import { PrismaClient } from "@prisma/client";
import express, { Router } from "express";
const router: Router = express.Router()
import { z } from "zod"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
const prisma = new PrismaClient()
import { SpecialKeys } from "../configs/config";

const userSchema = z.object({
    username: z.string().min(3).max(15),
    email: z.string().max(40).email(),
    password: z.string().max(20)
})



router.post('/signup', async (req, res) => {

    const parsedInput = userSchema.safeParse(req.body)
    if (!parsedInput.success) {
        console.log(parsedInput.error)
        res.status(411).json({ message: "There is an error while parsing user credentials" })
        return;
    }


    try {
        const username = parsedInput.data?.username;
        const email = parsedInput.data?.email;
        const password = parsedInput.data?.password
        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })

        res.status(201).send({ message: "You signup successfully!" })

    } catch (error) {
        console.log(error)
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    if (!user)
    {
        return;
    }
    const hashedPassword = user?.password;
    const isMatchPassword = await argon2.verify(hashedPassword, password);
    if (isMatchPassword)
    {
        const token = jwt.sign(user, SpecialKeys.SECRET_KEY, { expiresIn: "7d" })
        if (token)
        {
            res.json({message:"Logged in",token})
        }
        
    }

})


export default router
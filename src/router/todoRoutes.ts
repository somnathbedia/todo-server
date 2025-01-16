import express,{Request,Response} from "express"
const router = express.Router()
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateJwt } from "../auth/authenticator";
const prisma = new PrismaClient()
import { string, z } from "zod"

const TodoSchema = z.object({
    text:z.string().min(3).max(40)
})


router.get("/todos", authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
    const {...user} = req.user
    const todos = await prisma.todo.findMany({
        where: {
            userId:user.id
        }
    })
    if (todos.length > 0) {
        res.json({ todos })
        return;
    }
    res.status(200).json({ message: "Not found",todos })
})

router.post('/todos', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {

    const { ...user } = req.user
    try {
        const parsedInput = TodoSchema.safeParse(req.body)
        if (!parsedInput.success)
        {
            const errMsg = parsedInput.error.message
            res.status(411).json({ message: "There is an error while parsing user credentials",errMsg })
            return; 
        }
        const text = parsedInput.data.text
        const todo = await prisma.todo.create({
            data: {
                text,
                isCompleted: false,
                userId: user.id
            }
        })
        res.status(200).json({message:"Your todo has been created",todo})
    } catch (error) {
        res.send(204).json({message:"No Content has been created"})
    }
    
    
})

router.put("/todos/:id", authenticateJwt, async (req, res) => {
    const { id } = req.params

    const todo = await prisma.todo.update({
        where: {
            id,
        },
        data: {
            isCompleted:!false
        }
    })
    res.json({message:"Task Completed", todo })
})


router.delete("/todos/:id", authenticateJwt, async (req, res) => {
    const { id } = req.params
    const deltedTodo = await prisma.todo.delete({
        where: {
           id
       }
    })
    if (!deltedTodo) {
       res.status(400).json({message:"Not Exists"})
    }
    res.status(204).json({message:"Todo has been deleted",deltedTodo})
})


export default router
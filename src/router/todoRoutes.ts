import express,{Request,Response} from "express"
const router = express.Router()
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateJwt } from "../auth/authenticator";
const prisma = new PrismaClient()


router.get("/todos", authenticateJwt, async (req:Request, res:Response) => {
    const todos = await prisma.todo.findMany()
    if (todos.length > 0) {
        res.json({ todos })
        return;
    }
    res.json({ message: "Not found" })
})

router.post('/todos', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
    const { text } = req.body;
    const { ...user } = req.user
    try {
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


export default router
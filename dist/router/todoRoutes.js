"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const client_1 = require("@prisma/client");
const authenticator_1 = require("../auth/authenticator");
const prisma = new client_1.PrismaClient();
const zod_1 = require("zod");
const TodoSchema = zod_1.z.object({
    text: zod_1.z.string().min(3).max(40)
});
router.get("/todos", authenticator_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = __rest(req.user, []);
    const todos = yield prisma.todo.findMany({
        where: {
            userId: user.id
        }
    });
    if (todos.length > 0) {
        res.json({ todos });
        return;
    }
    res.status(200).json({ message: "Not found", todos });
}));
router.post('/todos', authenticator_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = __rest(req.user, []);
    try {
        const parsedInput = TodoSchema.safeParse(req.body);
        if (!parsedInput.success) {
            const errMsg = parsedInput.error.message;
            res.status(411).json({ message: "There is an error while parsing user credentials", errMsg });
            return;
        }
        const text = parsedInput.data.text;
        const todo = yield prisma.todo.create({
            data: {
                text,
                isCompleted: false,
                userId: user.id
            }
        });
        res.status(200).json({ message: "Your todo has been created", todo });
    }
    catch (error) {
        res.send(204).json({ message: "No Content has been created" });
    }
}));
router.put("/todos/:id", authenticator_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const todo = yield prisma.todo.update({
        where: {
            id,
        },
        data: {
            isCompleted: !false
        }
    });
    res.json({ message: "Task Completed", todo });
}));
router.delete("/todos/:id", authenticator_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deltedTodo = yield prisma.todo.delete({
        where: {
            id
        }
    });
    if (!deltedTodo) {
        res.status(400).json({ message: "Not Exists" });
    }
    res.status(204).json({ message: "Todo has been deleted", deltedTodo });
}));
exports.default = router;

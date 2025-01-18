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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const zod_1 = require("zod");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const config_1 = require("../configs/config");
const authenticator_1 = require("../auth/authenticator");
const userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(15),
    email: zod_1.z.string().max(40).email(),
    password: zod_1.z.string().max(20)
});
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parsedInput = userSchema.safeParse(req.body);
    if (!parsedInput.success) {
        res.status(411).json({ message: "There is an error while parsing user credentials" });
        return;
    }
    try {
        const username = (_a = parsedInput.data) === null || _a === void 0 ? void 0 : _a.username;
        const email = (_b = parsedInput.data) === null || _b === void 0 ? void 0 : _b.email;
        const password = (_c = parsedInput.data) === null || _c === void 0 ? void 0 : _c.password;
        const hashedPassword = yield argon2_1.default.hash(password);
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign(user, config_1.SpecialKeys.SECRET_KEY, { expiresIn: "7d" });
        if (token) {
            res.status(201).json({ message: "Successfully signed up", user, token });
            return;
        }
        res.status(400).send({ message: "Signup fails" });
    }
    catch (error) {
        res.status(409).json({ message: "May be duplicate data in the table", error });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            email,
        }
    });
    if (!user) {
        return;
    }
    const hashedPassword = user === null || user === void 0 ? void 0 : user.password;
    const isMatchPassword = yield argon2_1.default.verify(hashedPassword, password);
    if (isMatchPassword) {
        const token = jsonwebtoken_1.default.sign(user, config_1.SpecialKeys.SECRET_KEY, { expiresIn: "7d" });
        if (token) {
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });
            res.json({ message: "Logged in", token, user });
        }
    }
}));
router.get('/username', authenticator_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const u = __rest(req.user, []);
        const user = yield prisma.user.findUnique({
            where: {
                email: u.email
            }
        });
        res.json({ username: user === null || user === void 0 ? void 0 : user.username });
    }
    catch (error) {
        console.log(error);
    }
}));
exports.default = router;

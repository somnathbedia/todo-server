"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./configs/config");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./router/userRoutes"));
const todoRoutes_1 = __importDefault(require("./router/todoRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use('/users', userRoutes_1.default);
app.use("/todo", todoRoutes_1.default);
app.listen(config_1.SpecialKeys.PORT, () => {
    console.log(`Todo server is Active at port ${config_1.SpecialKeys.PORT}`);
});

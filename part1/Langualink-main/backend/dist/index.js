"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const UserManger_1 = require("./managers/UserManger");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // ✅ Pass `app`, not `http`
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const userManager = new UserManger_1.UserManager();
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on("user-info", (uuid, name, language) => {
        console.log(uuid);
        userManager.addUser(name, socket, language, uuid);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
        userManager.removeUser(socket.id);
    });
});
server.listen(3000, "0.0.0.0", () => {
    console.log('Listening on *:3000');
});

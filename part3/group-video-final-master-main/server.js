require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

const socketToRoom = {};


const queue = {} ;

queue['tamil'] = [] ;
queue['english'] = [] ;
queue['hindi'] = [] ;
queue['japan'] = [] ;
queue['korean'] = [] ;

const roomIdToWaitingMemberSocketId = {}


// queue['english'] = { {rank : 1, socketId : '123dsfsdfsd'} , { rank : 2, socketId : 'dfsdfds123' }, { rank : 3, socketId : 'fsdfsdfsd123' } }  ;

io.on('connection', socket => {
    console.log("connected");

    socket.on("wait for peer", (language, rank) => {
        console.log("language : ", language);
        console.log("rank : ", rank);
        console.log("socket.id : ", socket.id);
        console.log("queue : ", queue);

        queue[language].push({rank : rank, socketId : socket.id}) ;
        console.log("queue : ", queue);
    });   

    socket.on("Join other waiting peer on one to one", roomID => {
        const peerSocketId = roomIdToWaitingMemberSocketId[roomID] ; 
        io.to(peerSocketId).emit("room created by server", roomID);
    })

    socket.on("join room", roomID => {
        console.log("roomID : ", roomID);
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log("disconnected");
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }

        if (room) {
            room.forEach(id => {
                io.to(id).emit("peer disconnected", socket.id);
            });
        }
    });

});

// Set interval with 5 seconds
setInterval(() => {
    console.log("queue : ", queue);
    for (const language in queue) {
        if (queue[language].length > 1) {
            //Now sor the queue based on rank
            queue[language].sort((a, b) => 
                a.rank - b.rank
            );
            const len = queue[language].length;
            console.log("length : ", len);
            //connect all two pairs like 0,1 and 2,3 and so on
            for (let i = 0; i < len; i += 2) {
                const roomID = Math.random().toString(36).substring(7);
                const socketId1 = queue[language][i].socketId;
                const socketId2 = queue[language][i + 1].socketId;
                console.log("socketId1 : ", socketId1);
                console.log("socketId2 : ", socketId2);
                io.to(socketId1).emit("room created by server", roomID);
                // io.to(socketId2).emit("room created by server", roomID);
                roomIdToWaitingMemberSocketId[roomID] = socketId2 ; 
            }
            //remove the pairs from the queue
            queue[language] = queue[language].slice(len);
        }
    }
}, 10000);

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));



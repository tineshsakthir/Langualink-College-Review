"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId,
            partnerUuid: user2.uuid
        });
        user2.socket.emit("send-offer", {
            roomId,
            partnerUuid: user1.uuid
        });
    }
    // onOffer(roomId: string, sdp: string, senderSocketid: string, uuid: string) {
    //     const room = this.rooms.get(roomId);
    //     if (!room) {
    //         return;
    //     }
    //     const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
    //     receivingUser?.socket.emit("offer", {
    //         sdp,
    //         roomId,
    //         uuid
    //     })
    // }
    onOffer(roomId, sdp, senderSocketid, uuid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("offer", {
            sdp,
            roomId,
            uuid // Ensure UUID is sent
        });
    }
    // onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    //     const room = this.rooms.get(roomId);
    //     if (!room) {
    //         return;
    //     }
    //     const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
    //     receivingUser?.socket.emit("answer", {
    //         sdp,
    //         roomId
    //     });
    // }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("answer", {
            sdp,
            roomId,
            uuid: room.user1.socket.id === senderSocketid ? room.user1.uuid : room.user2.uuid // Send UUID
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;

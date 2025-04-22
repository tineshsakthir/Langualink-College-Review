import { v1 as uuid } from "uuid";
import io from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import { use } from "react";

const Home = (props) => {
    const socketRef = useRef();

    const [waiting, setWaiting] = useState(false);

    useEffect(() => {

        create();
       },[]);

   
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    function joinPeer(id) {
        props.history.push(`/room/${id}`);
    }

    function wait(){
        setWaiting(true);
        const min = Math.ceil(1);
        const max = Math.floor(10);
        const rank = Math.floor(Math.random() * (max - min + 1)) + min;
        socketRef.current = io.connect("http://localhost:8000");
        socketRef.current.emit("wait for peer", 'english', rank);
        socketRef.current.on("room created by server", roomID => {
            joinPeer(roomID);
        });
    }

    if(waiting){    
        return (
            <div>
                Waiting for a peer to join...
            </div>
        );
    }

   
    
    return (
        <div>
            <button onClick={create}>Create room</button>
            {/* <button onClick={join}>Join a room</button> */}
            <button onClick={wait}>Join a random person</button>
        </div>
    );
};

export default Home;

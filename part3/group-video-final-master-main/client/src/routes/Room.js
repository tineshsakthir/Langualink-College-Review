import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    background-color: #f0f2f5;
    padding: 20px;
`;

const VideoContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    width: 90%;
    margin-top: 20px;
`;

const StyledVideo = styled.video`
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    height: 300px;
    width: 400px;
    background: black;
`;

const Controls = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 12px 20px;
    background-color: ${props => props.bg || "#4CAF50"};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    &:hover {
        background-color: ${props => props.hoverBg || "#45a049"};
        transform: scale(1.05);
    }
`;

const Video = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [peer]);
    return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = ({ match }) => {
    const [peers, setPeers] = useState([]);
    const [muted, setMuted] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = match.params.roomID;

    useEffect(() => {
        socketRef.current = io.connect("http://localhost:8000");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({ peerID: userID, peer });
                    peers.push(peer);
                });
                setPeers(peers);
            });
            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({ peerID: payload.callerID, peer });
                setPeers(users => [...users, peer]);
            });
            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
            socketRef.current.on("peer disconnected", socketID => {
                window.location.reload();
            });
        });
    }, [roomID]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
            stream,
        });
        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
        });
        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
            stream,
        });
        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });
        peer.signal(incomingSignal);
        return peer;
    }

    const toggleMute = () => {
        userVideo.current.srcObject.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
        setMuted(!muted);
    };

    const toggleCamera = () => {
        userVideo.current.srcObject.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
        setCameraOn(!cameraOn);
    };

    const disconnect = () => {
        socketRef.current.disconnect();
        window.location.href = "/";
    };

    return (
        <Container>
            <h1>LanguaLink</h1>
            
            <VideoContainer>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => (
                    <Video key={index} peer={peer} />
                ))}
            </VideoContainer>
            <Controls>
                <Button onClick={() => navigator.clipboard.writeText(window.location.href)}>
                    Copy Room Link
                </Button>
                <Button onClick={toggleMute} bg="#ff9800" hoverBg="#e68900">
                    {muted ? "Unmute" : "Mute"}
                </Button>
                <Button onClick={toggleCamera} bg="#2196F3" hoverBg="#1976D2">
                    {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
                </Button>
                <Button onClick={disconnect} bg="#f44336" hoverBg="#d32f2f">
                    Disconnect
                </Button>
            </Controls>
        </Container>
    );
};

export default Room;



// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";
// import styled from "styled-components";

// const Container = styled.div`
//     padding: 20px;
//     display: flex;
//     height: 100vh;
//     width: 90%;
//     margin: auto;
//     flex-wrap: wrap;
// `;

// const StyledVideo = styled.video`
//     height: 40%;
//     width: 50%;
// `;

// const Video = (props) => {
//     const ref = useRef();

//     useEffect(() => {
//         props.peer.on("stream", stream => {
//             ref.current.srcObject = stream;
//         });
//     }, [props.peer]);    

//     return (
//         <StyledVideo playsInline autoPlay ref={ref} />
//     );
// }

// const videoConstraints = {
//     height: window.innerHeight / 2,
//     width: window.innerWidth / 2
// };

// const Room = (props) => {
//     const [peers, setPeers] = useState([]);
//     const socketRef = useRef();
//     const userVideo = useRef();
//     const peersRef = useRef([]);
//     const roomID = props.match.params.roomID;

//     useEffect(() => {
//         socketRef.current = io.connect("http://localhost:8000");

//         navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
//             userVideo.current.srcObject = stream;
//             socketRef.current.emit("join room", roomID);
//             socketRef.current.on("all users", users => {
//                 const peers = [];
//                 users.forEach(userID => {
//                     const peer = createPeer(userID, socketRef.current.id, stream);
//                     peersRef.current.push({
//                         peerID: userID,
//                         peer,
//                     })
//                     peers.push(peer);
//                 })
//                 setPeers(peers);
//             })

//             socketRef.current.on("user joined", payload => {
//                 const peer = addPeer(payload.signal, payload.callerID, stream);
//                 peersRef.current.push({
//                     peerID: payload.callerID,
//                     peer,
//                 })

//                 setPeers(users => [...users, peer]);
//             });

//             socketRef.current.on("receiving returned signal", payload => {
//                 const item = peersRef.current.find(p => p.peerID === payload.id);
//                 item.peer.signal(payload.signal);
//             });

//             //Now make opposite peer to join
//             socketRef.current.emit("Join other waiting peer on one to one", roomID) ; 


//              // **Handle peer disconnection**
//             socketRef.current.on("peer disconnected", (socketID) => {
//                 window.location.reload();

             
//             });
//         })
//     }, [roomID]); // Add roomID as a dependency

//     function createPeer(userToSignal, callerID, stream) {
//         const peer = new Peer({
//             initiator: true,
//             trickle: false,
//             config: {
//                 iceServers: [
//                     {
//                         urls: 'stun:stun.l.google.com:19302'
//                     }
//                 ]
//             },
//             stream,
//         });

//         peer.on("signal", signal => {
//             socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
//         })

//         return peer;
//     }

//     function addPeer(incomingSignal, callerID, stream) {
//         const peer = new Peer({
//             initiator: false,
//             trickle: false,
//                         config: {
//                 iceServers: [
//                     {
//                         urls: 'stun:stun.l.google.com:19302'
//                     }
//                 ]
//             },
//             stream,
//         })

//         peer.on("signal", signal => {
//             socketRef.current.emit("returning signal", { signal, callerID })
//         })

//         peer.signal(incomingSignal);

//         return peer;
//     }    


//     const copyLink = () => {
//         navigator.clipboard.writeText(window.location.href)
//           .then(() => alert("Room link copied to clipboard!"))
//           .catch(err => console.error("Failed to copy: ", err));
//       };



//     return (
//         <Container>
//             <button 
//     onClick={copyLink} 
//     style={buttonStyle} 
//     onMouseEnter={(e) => e.target.style.backgroundColor = buttonHoverStyle.backgroundColor}
//     onMouseLeave={(e) => e.target.style.backgroundColor = buttonStyle.backgroundColor}
// >
//     Copy Room Link
// </button>
            
//             <StyledVideo muted ref={userVideo} autoPlay playsInline />
//             {peers.map((peer, index) => {
//                 return (
//                     <Video key={index} peer={peer} />
//                 );
//             })}
            



//         </Container>
//     );
// };

// const buttonStyle = {
//     padding: "12px 20px",
//     backgroundColor: "#4CAF50",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontSize: "16px",
//     fontWeight: "bold",
//     transition: "background-color 0.3s ease, transform 0.2s ease",
//     marginTop: "10px",
//     boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//     height: "50px",
//     width: "200px",
// };

// const buttonHoverStyle = {
//     backgroundColor: "#45a049",
//     transform: "scale(1.05)",
// };


// export default Room;

















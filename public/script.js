const socket = io("/"); //localhost:3000
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement('video');
myVideo.muted = true; //mute my own audio
const peers = {}

//send my audio to other user
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVideoStream(myVideo,stream)
    
    myPeer.on('call',call=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)  
        })
    })
    
    socket.on("user-connected", (userId) => {
        connectToNewUser(userId,stream)
      });
      
})
socket.on("user-disconnected", (userId) => {
   if(peers[userId]){
    peers[userId].close()
   }
  });

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});


function connectToNewUser(userId,stream){
    const call = myPeer.call(userId,stream)//call the user with userId and send stream
    const video = document.createElement('video')
    //when the user send back their stream, we'll get this event called 'stream
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream)  
    })
    call.on('close',()=>{
        video.remove()
    })
    peers[userId] = call
}


//the function is defined on server.js
socket.emit("join-room", ROOM_ID, 10);

//test
// socket.on("user-connected", (userId) => {
//   console.log("user conneted" + userId);
// });

function addVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}
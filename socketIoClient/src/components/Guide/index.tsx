import styles from './index.module.css';
import { useEffect, useState } from 'react';
import Abc from './abc';

declare const window: any;

const Guide = () => {
  const [userId, setUserId] = useState('')
  const [socket, setSocket] = useState<any>()
  const [socketId, setSocketId] = useState('')
  const [message, setMessage] = useState('')
  const [messageList, setMessageList] = useState<any>([])
  const [targetSocketId, setTargetSocketId] = useState('')

  const initSocket = () => {
    const socket = window.io('http://localhost:7001/io', {
      query: {
        // userId: `client_${Math.random()}`,
      },
      transports: ['websocket']
    });
    socket.on('connect', () => {
      const id = socket.id;
      setSocketId(id)
      console.log('#connect,', id, socket);
      socket.on(id, msg => {
        console.log('#receive,', msg);
      });
    });
    // 接收在线用户信息
    socket.on('online', msg => {
      console.log('#online,', msg);
    });
    socket.on('disconnect', msg => {
      console.log('#disconnect', msg);
    });
    socket.on('disconnecting', () => {
      socket.emit('disconnecting')
      console.log('#disconnecting');
    });
    socket.on('error', () => {
      console.log('#error');
    });

    socket.on('auth', (res) => {
      console.log('auth successful>>', res)
    })

    socket.on('res', (msg) => {
      console.log('msg>>', msg)
      messageList.push(msg)
      setMessageList([...messageList])
    })
    setSocket(socket)
  }

  const onSendClick = () => {
    socket?.emit('msg', {
      target: targetSocketId,
      message
    })
  }

  useEffect(() => {
    initSocket()
  }, [])
  return (
    <div className={styles.container}>
      <Abc socket={socket} />
      {
        userId ? (
          <div>
            <p>当前userId: {userId}</p>
            <p>当前socketId: {socketId}</p>
            要发送的信息：<input value={message} onChange={(e) => {
              setMessage(e.target.value)
            }} type="text" /> <button onClick={() => { onSendClick() }}>发送</button> <br />
            目标socketId：<input value={targetSocketId} onChange={(e) => {
              setTargetSocketId(e.target.value)
            }} type='text' />
            <div>
              聊天信息:
              {
                messageList.map((msg, i) => {
                  return (
                    <div key={i}>{msg}</div>
                  )
                })
              }
            </div>
          </div>
        ) : (
          <button
            onClick={async () => {
              let res = await fetch('http://localhost:7001/login', {
                credentials: 'include' // 解决session失效的问题
              })
              let res2 = await res.json()
              setUserId(res2.userId)
            }}
          >
            登录
          </button>
        )
      }
    </div>
  );
};
export default Guide;


// 视频列表区域 
// const videos = document.querySelector('#videos') 
// // 本地视频预览 
// const localVideo = document.querySelector('#localVideo') 
// // 房间号 
// const roomId = document.querySelector('#roomId') 

// const query = new URLSearchParams(location.search) 
// const room = query.get('room') 

// if (!room) { 
//   location.replace(`/socket.html?room=${Math.random().toString(36).substr(2, 9)}`) 
// } 
// // 存储通信方信息 
// const remotes = {} 
// const socket = io.connect() 

// // socket发送消息 
// function sendMsg(target, msg) { 
//   console.log('->:', msg.type) 
//  msg.socketId = socket.id 
//   socket.emit('message', target, msg) 
// } 

// // 创建RTC对象，一个RTC对象只能与一个远端连接 
// function createRTC(stream, id) { 
//   const pc = new RTCPeerConnection({ 
//     iceServers: [ 
//       { 
//         urls: 'stun:stun.l.google.com:19302' 
//       } 
//     ] 
//   }) 

//  // 获取本地网络信息，并发送给通信方 
//   pc.addEventListener('icecandidate', event => { 
//     if (event.candidate) { 
//  // 发送自身的网络信息到通信方 
//       sendMsg(id, { 
//         type: 'candidate', 
//         candidate: { 
//           sdpMLineIndex: event.candidate.sdpMLineIndex, 
//           sdpMid: event.candidate.sdpMid, 
//           candidate: event.candidate.candidate 
//         } 
//       }) 
//     } 
//   }) 

//  // 有远程视频流时，显示远程视频流 
//   pc.addEventListener('track', event => { 
//     remotes[id].video.srcObject = event.streams[0] 
//   }) 

//  // 添加本地视频流到会话中 
//  stream.getTracks().forEach(track => pc.addTrack(track, stream)) 

//  // 用于显示远程视频 
//   const video = document.createElement('video') 
//   video.setAttribute('autoplay', true) 
//   video.setAttribute('playsinline', true) 
//   videos.append(video) 
//   remotes[id] = { 
//     pc, 
//     video 
//   } 
// } 

// navigator.mediaDevices 
//   .getUserMedia({ 
//     audio: false, // 本地测试防止回声 
//     video: true 
//   }) 
//   .then(stream => { 
//     roomId.innerHTML = room 
//     localVideo.srcObject = stream 

//  // 创建或者加入房间，具体是加入还是创建需看房间号是否存在 
//     socket.emit('create or join', room) 

//     socket.on('leaveed', function (id) { 
//       console.log('leaveed', id) 
//       if (remotes[id]) { 
//         remotes[id].pc.close() 
//         videos.removeChild(remotes[id].video) 
//         delete remotes[id] 
//       } 
//     }) 

//     socket.on('full', function (room) { 
//       console.log('Room ' + room + ' is full') 
//       socket.close() 
//       alert('房间已满') 
//     }) 

//     socket.on('message', async function (message) { 
//       console.log('<-:', message.type) 
//       switch (message.type) { 
//         case 'join': { 
//  // 有新的人加入就重新设置会话，重新与新加入的人建立新会话 
//           createRTC(stream, message.socketId) 
//           const pc = remotes[message.socketId].pc 
//           const offer = await pc.createOffer() 
//           pc.setLocalDescription(offer) 
//           sendMsg(message.socketId, { type: 'offer', offer }) 
//           break 
//         } 
//         case 'offer': { 
//           createRTC(stream, message.socketId) 
//           const pc = remotes[message.socketId].pc 
//           pc.setRemoteDescription(new RTCSessionDescription(message.offer)) 
//           const answer = await pc.createAnswer() 
//           pc.setLocalDescription(answer) 
//           sendMsg(message.socketId, { type: 'answer', answer }) 
//           break 
//         } 
//         case 'answer': { 
//           const pc = remotes[message.socketId].pc 
//           pc.setRemoteDescription(new RTCSessionDescription(message.answer)) 
//           break 
//         } 
//         case 'candidate': { 
//           const pc = remotes[message.socketId].pc 
//           pc.addIceCandidate(new RTCIceCandidate(message.candidate)) 
//           break 
//         } 
//         default: 
//           console.log(message) 
//           break 
//       } 
//     }) 
//   })
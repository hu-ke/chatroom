import { useEffect } from "react"


const Abc = ({ socket }) => {
    // const room = Math.random().toString(36).substr(2, 9)
    const room = 'hkhk'
    useEffect(() => {
        if (!socket) {
            return
        }
        // 视频列表区域 
        const videos = document.querySelector('#videos') as any;
        // 本地视频预览 
        const localVideo = document.querySelector('#localVideo') as any;
        // 远程视频预览 
        const video = document.querySelector('#video') as any;

        const roomId = document.querySelector('#roomId') as any

        // 存储通信方信息 
        const remotes = {}
        // socket发送消息 
        function sendMsg(target, msg) {
            console.log('->:', msg.type)
            msg.socketId = socket.id
            socket.emit('message', target, msg)
        }

        // 创建RTC对象，一个RTC对象只能与一个远端连接 
        function createRTC(stream, id) {
            const pc = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: 'stun:stun.l.google.com:19302'
                    }
                ]
            })

            // 获取本地网络信息，并发送给通信方 
            pc.addEventListener('icecandidate', event => {
                console.log('icecandidate>>')
                if (event.candidate) {
                    // 发送自身的网络信息到通信方 
                    sendMsg(id, {
                        type: 'candidate',
                        candidate: {
                            sdpMLineIndex: event.candidate.sdpMLineIndex,
                            sdpMid: event.candidate.sdpMid,
                            candidate: event.candidate.candidate
                        }
                    })
                }
            })

            // 有远程视频流时，显示远程视频流 
            pc.addEventListener('track', event => {
                console.log('track>>')
                remotes[id].video.srcObject = event.streams[0]
            })

            // 添加本地视频流到会话中 
            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            // 用于显示远程视频 
            // const video = document.createElement('video')
            // video.setAttribute('autolay', true)
            // video.setAttribute('playsinline', true)
            // videos.append(video)
            remotes[id] = {
                pc,
                video
            }
        }

        navigator.mediaDevices
            .getUserMedia({
                audio: true, // 本地测试防止回声 
                video: true
            })
            .then(localStream => {
                roomId.innerHTML = room
                localVideo.srcObject = localStream

                // 创建或者加入房间，具体是加入还是创建需看房间号是否存在 
                socket.emit('createOrJoin', room)

                // socket.on('leaveed', function (id) {
                //     console.log('leaveed', id)
                //     if (remotes[id]) {
                //         remotes[id].pc.close()
                //         videos.removeChild(remotes[id].video)
                //         delete remotes[id]
                //     }
                // })

                // socket.on('full', function (room) {
                //     console.log('Room ' + room + ' is full')
                //     socket.close()
                //     alert('房间已满')
                // })

                socket.on('message', async function (message) {
                    console.log('<-:', message.type)
                    switch (message.type) {
                        case 'join': {
                            console.log('join.')
                            // 有新的人加入就重新设置会话，重新与新加入的人建立新会话 
                            createRTC(localStream, message.socketId)
                            const pc = remotes[message.socketId].pc
                            const offer = await pc.createOffer()
                            console.log('offer', offer)
                            pc.setLocalDescription(offer)
                            sendMsg(message.socketId, { type: 'offer', offer })
                            break
                        }
                        case 'offer': {
                            console.log('offer.')
                            createRTC(localStream, message.socketId)
                            const pc = remotes[message.socketId].pc
                            pc.setRemoteDescription(new RTCSessionDescription(message.offer))
                            const answer = await pc.createAnswer()
                            pc.setLocalDescription(answer)
                            sendMsg(message.socketId, { type: 'answer', answer })
                            break
                        }
                        case 'answer': {
                            const pc = remotes[message.socketId].pc
                            pc.setRemoteDescription(new RTCSessionDescription(message.answer))
                            break
                        }
                        case 'candidate': {
                            const pc = remotes[message.socketId].pc
                            pc.addIceCandidate(new RTCIceCandidate(message.candidate))
                            break
                        }
                        default:
                            console.log(message)
                            break
                    }
                })
            }).catch((e) => {
                alert(e)
            })


    }, [socket])

    return (
        <div>
            <h2>
                <span>房间号：</span>
                <span id="roomId"></span>
            </h2>
            <div id="videos" >
                <video id="localVideo" autoPlay muted playsInline></video>
                <video id="video" autoPlay muted playsInline></video>
            </div>

        </div>
    )
}

export default Abc
import { useEffect, useState, useRef } from "react"
import './index.module.css'

const createElementFromString = (htmlString) => {
    const div = document.createElement('div')
    div.innerHTML = htmlString
    return div.firstChild
}

// 碰到问题按这个顺序来调试:
// 调用peerA (RTCPeerConnection对象) createOffer方法准备创建SDP
// 在createOffer的回调方法里，同时做了这两件事
// 调用peerA的setLocalDescription(description)方法，这个方法会触发peerA的icecandidate 监听方法handleConnection. 在这个方法里，会将peerA的icecandidate发送给peerB. 然后PeerB执行addIceCandidate(candidate)，将peerA的candidate登记在案.
// 将peerA的description (就是SDP)发送给peerB
// peerB收到peerA发来的SDP，执行createAnswer，在这个回调方法里，同时做两件事
// 调用peerB的setLocalDescription(description)方法，这个方法会触发peerB的icecandidate监听方法handleConnection，在这个方法里，会将peerB的icecandidate发送给peerA. peerA收到后执行addIceCandidate(candidate)，将peerB的candidate也登记
// 将peerB的SDP发送给peerA.
// peerA和peerB开始传递音视频
const Abc = ({ socket }) => {
    // const room = Math.random().toString(36).substr(2, 9)
    const room = 'hkhk'
    const videosEle = useRef() as any;
    const localVideoEle = useRef() as any;
    // 存储通信方信息 
    const [remotes, setRemotes] = useState({})
    // 本地流
    const [localStream, setLocalStream] = useState() as any;

    // socket发送消息 
    const sendMsg = (target, msg) => {
        console.log('->:', msg.type)
        msg.socketId = socket.id
        socket.emit('message', target, msg)
    }

    // 创建RTC对象，一个RTC对象只能与一个远端连接 
    const createRTC = (stream, id) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        })

        // 获取本地网络信息，并发送给通信方 
        pc.addEventListener('icecandidate', event => {
            // 触发时机是在pc.setLocalDescription之后
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

        const video = createElementFromString('<video autoPlay muted playsInline></video>')
        videosEle.current.append(video)
        remotes[id] = {
            pc,
            video
        }
        setRemotes({ ...remotes })
    }
    // 初始化各video元素
    const initElements = () => {
        // 视频列表区域 
        const videos = document.querySelector('#videos') as any;
        videosEle.current = videos
        // 本地视频预览 
        localVideoEle.current = document.querySelector('#localVideo') as any;
    }

    // 在获取到localStream之后，监听事件
    useEffect(() => {
        if (localStream) {
            initEvents()
        }
    }, [localStream])

    const initEvents = () => {
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
                    // 有新的人加入就重新设置会话，重新与新加入的人建立新会话 
                    createRTC(localStream, message.socketId)
                    const pc = remotes[message.socketId].pc
                    const offer = await pc.createOffer() // 打印offer，其实就是一个RTCSessionDescription对象。包含sdp，type：offer/answer两个字段
                    // setLocalDescription 提交所有请求的更改。 addTrack createDataChannel 和其他类似的调用都是临时的 (调用 setLocalDescription 后生效)。 调用 setLocalDescription 时，使用由 createOffer 生成的值。
                    pc.setLocalDescription(offer)
                    sendMsg(message.socketId, { type: 'offer', offer })
                    break
                }
                case 'offer': {
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
                    pc.addIceCandidate(new RTCIceCandidate(message.candidate)) // 将对方peer的candidate登记在案
                    break
                }
                default:
                    console.log(message)
                    break
            }
        })
    }
    useEffect(() => {
        if (!socket) {
            return
        }
        initElements()
    }, [socket])

    // 检查本地音视频，并将stream导入video元素中
    const detectLocalMedia = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true, // 本地测试防止回声 
                video: true
            })
            .then(localStream => {
                localVideoEle.current.srcObject = localStream
                setLocalStream(localStream)
                // 创建或者加入房间，具体是加入还是创建需看房间号是否存在 
                socket.emit('createOrJoin', room)

            }).catch((e) => {
                alert(e)
            })
    }

    return (
        <div>
            <button
                onClick={() => {
                    detectLocalMedia()
                }}
            >
                开启本地视频音频
            </button>
            <h2>
                <span>房间号：</span>
                <span>{room}</span>
            </h2>
            <div id="videos" >
                <video id="localVideo" autoPlay muted playsInline></video>
                {/* <video id="video" autoPlay muted playsInline></video> */}
            </div>

        </div>
    )
}

export default Abc
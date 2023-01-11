import './index.less';
import { useEffect, useState } from 'react';
import VideoRoom from './videoRoom';
import ChatRoom from './chatRoom';

declare const window: any;

const Guide = () => {
  const [userId, setUserId] = useState('')
  const [socket, setSocket] = useState<any>()
  const [socketId, setSocketId] = useState<string>('')

  const initSocket = () => {
    const socket = window.io('http://172.20.10.8:7001/io', {
      query: {
        // userId: `client_${Math.random()}`,
      },
      transports: ['websocket']
    });
    socket.on('connect', () => {
      const id = socket.id;
      setSocketId(id)
      // console.log('#connect,', id, socket);
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
      if (res?.userId) {
        setUserId(res.userId)
      }
    })

    setSocket(socket)
  }

  useEffect(() => {
    initSocket()
  }, [])

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p>当前socketId: {socketId}</p>
        <p>当前userId: {userId}</p>
        {
          !userId ? (
            <button
              onClick={async () => {
                let res = await fetch('http://172.20.10.8:7001/login', {
                  credentials: 'include' // 解决session失效的问题
                })
                let res2 = await res.json()
                setUserId(res2.userId)
              }}
            >
              登录
            </button>
          ) : ''
        }
      </div>
      <div className="container">
        <div className="container-videoRoom">
          <VideoRoom socket={socket} />
        </div>
        <div className="container-chatRoom">
          <ChatRoom socket={socket} />
        </div>
      </div>
    </div>
  );
};
export default Guide;

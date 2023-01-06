import { useEffect, useState, useRef } from "react"

const chatRoom = ({ socket }) => {
    const [targetSocketId, setTargetSocketId] = useState('')
    const [message, setMessage] = useState('')
    const [messageList, setMessageList] = useState<any>([])

    const onSendClick = () => {
        console.log('-->', message)
        socket?.emit('msg', {
            target: targetSocketId,
            message
        })
    }

    useEffect(() => {
        if (!socket) {
            return
        }
        socket.on('res', ({ msg, userId }) => {
            console.log('<--', msg, userId)
            messageList.push({
                msg,
                userId: userId ? userId.slice(-5) : ''
            })
            setMessageList([...messageList])
        })
    }, [socket])
    return (
        <div style={{ border: '1px solid blue', padding: '20px', height: '600px' }}>
            要发送的信息：<input value={message} onChange={(e) => {
                setMessage(e.target.value)
            }} type="text" /> <button onClick={() => { onSendClick() }}>发送</button> <br />
            目标socketId：<input value={targetSocketId} onChange={(e) => {
                setTargetSocketId(e.target.value)
            }} type='text' />
            <div>
                聊天信息:
                {
                    messageList.map(({ msg, userId }, i) => {
                        return (
                            <div key={i}><span style={{ color: 'red' }}>{userId}:</span> {msg}</div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default chatRoom
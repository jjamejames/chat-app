import React, { useContext, useEffect, useState } from 'react'
import './chatBox.css'
import assets from '../../assets/assets'
import { appContext } from '../../context/appContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import Upload from '../../lib/upload'

const ChatBox = () => {
    const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(appContext)
    const [input, setInput] = useState('')
    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), { // update message
                    messages: arrayUnion({
                        sId: userData.id, // ผู้ส่งคือเรา
                        text: input,
                        createdAt: new Date()
                    })
                })
                const userIDs = [chatUser.rId, userData.id] // id ผู้รับสาร กับ id ผู้ส่งสาร
                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id)
                    const userChatSnap = await getDoc(userChatsRef)
                    if (userChatSnap.exists()) { // ถ้ามีแชทอยู่แล้ว
                        const userChatData = userChatSnap.data()
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId)
                        userChatData.chatsData[chatIndex].lastmessage = input.slice(0, 30)
                        userChatData.chatsData[chatIndex].updatedAt = Date.now()
                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false
                        }
                        await updateDoc(userChatsRef, {
                            chatsData: userChatData.chatsData
                        })
                    }
                })
            }
        } catch (error) {
            toast.error(error.message)
        }
        setInput('')
    }
    const convertTimeStamp = (timestamp) => {
        let date = timestamp.toDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        if (hour > 12) {
            return hour - 12 + ":" + minute + "PM"
        }
        else {
            return hour + ":" + minute + "AM"
        }
    }
    const sendImage = async (e) => {
        try {
            const fileUrl = await Upload(e.target.files[0])
            if (fileUrl && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), { // update message
                    messages: arrayUnion({
                        sId: userData.id, // ผู้ส่งคือเรา
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })
                const userIDs = [chatUser.rId, userData.id] // id ผู้รับสาร กับ id ผู้ส่งสาร
                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id)
                    const userChatSnap = await getDoc(userChatsRef)
                    if (userChatSnap.exists()) { // ถ้ามีแชทอยู่แล้ว
                        const userChatData = userChatSnap.data()
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId)
                        userChatData.chatsData[chatIndex].lastmessage = "Image"
                        userChatData.chatsData[chatIndex].updatedAt = Date.now()
                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false
                        }
                        await updateDoc(userChatsRef, {
                            chatsData: userChatData.chatsData
                        })
                    }
                })
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                setMessages(res.data().messages.reverse())
            })
            return () => {
                unSub()
            }
        }
    }, [messagesId])
    return chatUser ? (
        <div className={`h-[75vh] relative bg-[#f1f5ff] w-full ${chatVisible ? 'block' : 'hidden md:block'}`}>
            <div className='px-2.5 py-[15px] flex items-center gap-2.5 border-b-[#c6c6c6] border-b-[1px] '>
                <img className='w-[25px] rounded-[50%]' src={chatUser.userData.avatar} alt="" />
                <p className='flex-1 font-medium text-[20px] text-[#393939] flex items-center gap-2.5'>
                    {chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='w-[15px]' src={assets.green_dot} alt="" /> : null}
                </p>
                <img className='w-[25px] aspect-square hidden md:block' src={assets.help_icon} alt="" />
                <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className='aspect-square w-[25px] block md:hidden' alt="" />
            </div>

            <div className='h-[calc(100%-70px)] pb-12 overflow-y-scroll flex flex-col-reverse'>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {msg["image"]
                            ? <img className='msg-img' src={msg.image}></img>
                            : <p className='msg'>{msg.text}</p>
                        }
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex items-center gap-3 px-2.5 py-[15px] bg-white absolute bottom-0 left-0 right-0'>
                <input onChange={(e) => setInput(e.target.value)} value={input} className='flex-1 border-0 outline-none' type="text" placeholder='Send a message' />
                <input onChange={sendImage} className='flex-1 border-0 outline-none' type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label className='flex' htmlFor="image">
                    <img className='w-[22px] cursor-pointer' src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} className='w-[30px] cursor-pointer' src={assets.send_button} alt="" />
            </div>
        </div>
    )
        : <div className={`w-[100%] flex flex-col items-center justify-center gap-5 text-[#adadad]  ${chatVisible ? '' : 'hidden md:flex'}`}>
            <img className='w-[80px] ' src={assets.logo_icon} alt="" />
            <p className='text-2xl font-medium text-[#383838]'>Chat anytime, anywhere</p>
        </div>
}

export default ChatBox

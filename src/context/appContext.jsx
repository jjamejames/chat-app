import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../config/firebase'
import { useNavigate } from 'react-router-dom'

export const appContext = createContext()
const AppContextProvider = (props) => {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [chatData, setChatData] = useState([]) // [{lastmessage : "", messageId :'',messageSeen: true,rId"DbRTWeJbQdOgXhqwvgjs5Yi3lH62",updatedAt:1756836583934,userData:{....}},{}]
    const [messagesId, setMessagesId] = useState(null)
    const [messages, setMessages] = useState([]) // [{createdAt:1566,rId:'sdsdsd',text:'asdsd'},{createdAt:1566,rId:'sdsdsd',image:'asdsd'},{}]
    const [chatUser, setChatUser] = useState(null)
    const [chatVisible, setChatVisible] = useState(false)
    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid) // อ้างอิงไปที่ doc เฉพาะตัวใน collection users ที่มี id เป็น user.id ใช้สำหรับแก้ไข doc ตัวเดียวใน collection
            const userSnap = await getDoc(userRef)
            const userData = userSnap.data()
            // console.log(userData);
            setUserData(userData)
            if (userData.avatar && userData.name) {
                navigate('/chat')
            }
            else {
                navigate('/profile')
            }
            await updateDoc(userRef, {
                lastSeen: Date.now()
            })
            setInterval(async () => {
                if (auth) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000);
        } catch (error) {

        }
    }
    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id) // หา collection chats ที่มี doc ของ user ที่ login
            const unSub = onSnapshot(chatRef, async (res) => { // การ listen to doc นี้แบบ real-time
                const chatItems = res.data().chatsData //ดึงข้อมูล chatsData จาก document เมื่อมีการเปลี่ยนแปลง
                const tempData = []
                for (const item of chatItems) { // นำ chatItems ออกมา
                    const userRef = doc(db, 'users', item.rId) // ให้เข้าถึง doc ของ collection users ที่มี id ตรงกับ rId
                    const userSnap = await getDoc(userRef)
                    const userData = userSnap.data() // ได้ userData ที่มีค่าตรงกับ rId
                    tempData.push({ ...item, userData }) // ได้ chatData ของเดิม + ข้อมูลของ user ที่เคยคุยด้วย     
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt))
            })
            return () => {
                unSub() // เมื่อถูก unmount หรือ userData เปลี่ยนจะ unsub
            }
        }
    }, [userData])


    const value = {
        userData, setUserData, chatData, setChatData, loadUserData, navigate, messagesId, setMessagesId, messages, setMessages, chatUser, setChatUser, chatVisible, setChatVisible
    }
    return (
        <appContext.Provider value={value}>
            {props.children}
        </appContext.Provider>
    )
}

export default AppContextProvider

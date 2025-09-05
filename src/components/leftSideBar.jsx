import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { appContext } from '../context/appContext'
import { db, logout } from '../config/firebase'
import { collection, getDocs, where, query, setDoc, serverTimestamp, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'

const LeftSideBar = () => {
    const { navigate, userData, chatData, chatUser, setChatUser, messagesId, setMessagesId, chatVisible, setChatVisible } = useContext(appContext)
    const [user, setUser] = useState(null) // สำหรับตอน search
    const [showSearch, setShowSearch] = useState(false)
    const inputHandler = async (e) => {
        try {
            const input = e.target.value
            if (input) {
                setShowSearch(true)
                const userRef = collection(db, 'users') //  อ้างอิงไปที่ collection ใช้สำหรับแก้ไข doc หลายตัวใน collection
                const q = query(userRef, where('username', '==', input.toLowerCase())) // เป็นการสร้าง queries ในการหา user ใน collection users เงื่อนไขคือ input ตรงกับ username
                const querySnap = await getDocs(q) // get Doc ตามที่ query
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) { // ถ้าค่าไม่ว่างและค่ามี id ไม่เท่ากับ id ที่ login เข้ามา
                    let userExist = false
                    chatData.map((chat) => { // นำมา map ถ้า rId ตรงกับ ที่ search
                        if (chat.rId === querySnap.docs[0].data().id) {
                            userExist = true // กำหนดให้ user มีอยู่แล้ว
                        }
                    })
                    if (!userExist) { // ถ้า user exist เป็น false จะ setUser ใหม่
                        setUser(querySnap.docs[0].data())
                    }
                }
                else {
                    setUser(null)
                }
            }
            else {
                setShowSearch(false)
            }
        } catch (error) {

        }
    }

    const addChat = async () => { // สร้างห้อง chat
        const messagesRef = collection(db, "messages") // อ้างอิงไปที่ collection ใช้สำหรับแก้ไข doc หลายตัวใน collection
        const chatsRef = collection(db, 'chats')
        try {
            const newMessageRef = doc(messagesRef)  // อ้างอิงไปที่ doc ของ collection messages
            await setDoc(newMessageRef, { // สร้าง doc ใหม่ เป็นตัวอ้างอิงว่าห้องแชทไหน
                createdAt: serverTimestamp(),
                messages: []
            })
            await updateDoc(doc(chatsRef, user.id), { // update collection chats doc เป็น id user ที่ search
                chatsData: arrayUnion({ // เป็นการเพิ่มค่าลงใน array field ของ document โดยจะไม่เพิ่มค่าซ้ำ
                    messageId: newMessageRef.id,
                    lastmessage: '',
                    rId: userData.id, // มาจาก id ของ user ที่ login
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastmessage: '',
                    rId: user.id, // มาจาก id ของ user ที่ search
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            const uSnap = await getDoc(doc(db, 'users', user.id))
            const uData = uSnap.data()
            setChat({
                messageId: newMessageRef.id,
                lastmessage: '',
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            })
            setShowSearch(false)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const setChat = async (item) => { // เมื่อคลิกที่ user ผู้ติดต่อ
        try {
            setMessagesId(item.messageId) // ส่งห้อง chat ของ user ไปว่าเป็น messageId อะไร
            setChatUser(item)// set chat ของ user คนที่คลิกเข้าไปโดยเอาให้เป็น chatData ของคนนั้น(มีuserData ด้วย)
            const userChatsRef = doc(db, 'chats', userData.id)
            const userChatsSnapshot = await getDoc(userChatsRef)
            const userChatsData = userChatsSnapshot.data()
            const chatsIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId)
            userChatsData.chatsData[chatsIndex].messageSeen = true
            await updateDoc(userChatsRef, {
                chatsData: userChatsData.chatsData
            })
            setChatVisible(true)
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, 'users', chatUser.userData.id)
                const userSnap = await getDoc(userRef)
                const userData = userSnap.data()
                setChatUser(prev => ({ ...prev, userData: userData }))
            }
        }
        updateChatUserData()
    }, [chatData])

    return (
        <div className={`bg-[#001030] text-white h-[75vh] ${chatVisible ? 'hidden md:block' : 'block'} w-full`}>
            <div className='p-5 '>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} className='max-w-[140px]' alt="" />
                    <div className='relative py-[10px] px-0 group'>
                        <img className='max-h-[20px] opacity-[0.6]' src={assets.menu_icon} alt="" />
                        <div className='absolute top-[100%] right-0 w-[130px] p-5 rounded-[5px] bg-white text-black hidden group-hover:block'>
                            <p onClick={() => navigate('/profile')} className='cursor-pointer text-[14px]'>Edit Profile</p>
                            <hr className='border-0 h-[1px] bg-[#a4a4a4] my-[8px] mx-0' />
                            <p onClick={() => logout()} className='cursor-pointer text-[14px]'>Logout</p>
                        </div>
                    </div>
                </div>
                <div className='bg-[#002670] flex items-center gap-2.5 px-2.5 py-3 mt-[20px]'>
                    <img className='w-[16px]' src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} className='bg-transparent border-0 outline-none text-white text-[11px] placeholder:text-[#c8c8c8]' type="text" placeholder='Search here...' />
                </div>
            </div>
            <div className='flex flex-col h-[70%] overflow-y-scroll '>
                {showSearch && user
                    ? <div onClick={addChat} className='flex items-center gap-2.5 px-5 py-5 cursor-pointer text-[13px] hover:bg-[#077eff] '>
                        <img src={user.avatar} className='w-[35px] aspect-square rounded-[50%]' alt="" />
                        <p>{user.name}</p>
                    </div>
                    : chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className='flex items-center gap-2.5 py-5 px-5 cursor-pointer text-[13px] hover:bg-[#077eff] group'>
                            <img className={`w-[35px] aspect-square rounded-[50%] ${item.messageSeen || item.messageId === messagesId ? '' : 'border-[#07fff3] border-2'}`} src={item.userData.avatar} alt="" />
                            <div className='flex flex-col'>
                                <p>{item.userData.name}</p>
                                <span className={`text-[11px] group-hover:text-white ${item.messageSeen || item.messageId === messagesId ? 'text-white' : 'text-[#07fff3]'}`}>{item.lastmessage}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default LeftSideBar

import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { logout } from '../config/firebase'
import { appContext } from '../context/appContext'

const RightSideBar = () => {
    const { chatUser, messages } = useContext(appContext)
    const [msgImages, setMsgImages] = useState([])
    useEffect(() => {
        let tempData = []
        messages.map((msg) => {
            if (msg.image) {
                tempData.push(msg.image)
            }
            setMsgImages(tempData)
        })
    }, [messages])
    return chatUser ? (
        <div className='hidden md:block text-white bg-[#001030] relative h-[75vh] overflow-y-scroll'>
            <div className='pt-[60px] text-center m-auto max-w-[70%] flex flex-col justify-center items-center'>
                <img className='w-[110px] aspect-square rounded-[50%]' src={chatUser.userData.avatar} alt="" />
                <h3 className='text-[18px] font-medium flex items-center justify-center gap-2.5 mx-1.5 my-0'>{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='w-[15px]' src={assets.green_dot} alt="" /> : null} {chatUser.userData.name}</h3>
                <p className='text-[10px] font-medium opacity-[80%] '>{chatUser.userData.bio} </p>
            </div>
            <hr className='border-[#ffffff50] my-3.5 mx-0' />
            <div className='px-[20px] py-0 text-[13px]'>
                <p>Media</p>
                <div className='max-h-[180px] overflow-y-scroll grid grid-cols-[1fr_1fr_1fr] gap-2.5 mt-2'>
                    {msgImages.map((url, index) => {
                        return <img className='w-[60px] rounded-[4px] cursor-pointer' onClick={() => window.open(url)} src={url} key={index}></img>
                    })}
                </div>
            </div>
            <button onClick={() => logout()} className='absolute bottom-[20px] right-[50%] translate-x-[50%] bg-[#077eff] text-white border-0 text-[12px] font-[300px] py-[10px] px-[65px] rounded-[20px] cursor-pointer'>Logout</button>
        </div>
    )
        :
        <div className='text-white bg-[#001030] relative h-[75vh] overflow-y-scroll'>
            <button onClick={() => logout()} className='absolute bottom-[20px] right-[50%] translate-x-[50%] bg-[#077eff] text-white border-0 text-[12px] font-[300px] py-[10px] px-[65px] rounded-[20px] cursor-pointer'>Logout</button>
        </div>
}

export default RightSideBar

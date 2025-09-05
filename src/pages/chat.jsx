import React, { useContext, useEffect, useState } from 'react'
import LeftSideBar from '../components/leftSideBar'
import ChatBox from '../components/chatBox/chatBox'
import RightSideBar from '../components/rightSIdeBar'
import { appContext } from '../context/appContext'

const Chat = () => {
  const { chatData, userData } = useContext(appContext)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (chatData && userData) {
      setLoading(false)
    }
  }, [chatData, userData])
  return (
    <div className='min-h-[100vh] bg-gradient-to-r from-[#596aff] to-[#383699] grid place-items-center'>
      {loading
        ? <p className='text-[30px] md:text-5xl text-white'>Loading...</p>
        : <div className='flex w-[95%] h-[75vh] max-w-[1000px] bg-[aliceblue] md:grid md:grid-cols-[1fr_2fr_1fr]'>
          <LeftSideBar />
          <ChatBox />
          <RightSideBar></RightSideBar>
        </div>
      }

    </div>
  )
}

export default Chat

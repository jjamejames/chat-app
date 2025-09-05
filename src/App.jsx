import React, { useContext, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/login'
import ProfileUpdate from './pages/profileUpdate'
import Chat from './pages/chat'
import { ToastContainer, toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { appContext } from './context/appContext'

const App = () => {
  const navigate = useNavigate()
  const {loadUserData} = useContext(appContext)
  useEffect(()=>{
    onAuthStateChanged(auth,async(user)=>{ // user คือ Object User ของ Firebase จากอินสแตนซ์ auth
      if (user) {
        // console.log(user)
        navigate('/chat')
        await loadUserData(user.uid)
      }
      else{
        navigate('/')
      }
    })
  },[])
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable />
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/profile' element={<ProfileUpdate />}></Route>
        <Route path='/chat' element={<Chat />}></Route>
      </Routes>
    </div>
  )
}

export default App

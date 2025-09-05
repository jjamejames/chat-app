import React, { useState } from 'react'
import assets from '../assets/assets.js'
import { signup, login, resetPassword } from '../config/firebase.js'
import { toast } from 'react-toastify'


const Login = () => {
  const [currentState, setCurrentState] = useState('Sign Up')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const onSubmitHandler = (e) => {
    e.preventDefault()
    if (currentState === 'Sign Up') {
      if (password.length < 8) {
        return toast.error('Password must be longer than 8 characters')
      }
      signup(username, email, password)
    }
    else {
      login(email, password)
      toast.success('loginsuccess')
    }
  }
  return (
    <div className='flex flex-col sm:flex-row gap-8 items-center justify-evenly min-h-[100vh] bg-[url("/background.png")] bg-no-repeat bg-cover '>
      <img className='w-[max(20vw,200px)]' src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} action="" className='flex flex-col bg-white  py-6 px-8 rounded-[10px] gap-5'>
        <h2 className='font-semibold text-2xl'>{currentState}</h2>
        {currentState === 'Sign Up'
          ? <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} placeholder='Username' className="px-2 py-2 border-[#c9c9c9] border rounded-sm outline-[#077eff]" required />
          : null}
        <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email Address' className="px-2 py-2 border-[#c9c9c9] border rounded-sm outline-[#077eff]" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Password' className="px-2 py-2 border-[#c9c9c9] border rounded-sm outline-[#077eff]" />
        <button type='submit' className='text-[16px] border-0 rounded-sm px-3 py-2 text-white bg-[#077eff] cursor-pointer'>{currentState === 'Sign Up' ? 'Create Account' : 'Login now'}</button>
        <div className='flex gap-1 text-[12px] text-[#808080]'>
          <input id='agreeTerm' type="checkbox" required />
          <label htmlFor='agreeTerm'>Agree to the terms of use & privacy policy</label>
        </div>
        <div className='flex flex-col gap-1'>
          {currentState === 'Sign Up'
            ? <p className='text-[13px] text-[#5c5c5c]'>Already have an account <span onClick={() => setCurrentState('Login')} className='cursor-pointer text-[#077eff] font-semibold'><u>Login here</u></span></p>
            : <p className='text-[13px] text-[#5c5c5c]'>Create an account <span onClick={() => setCurrentState('Sign Up')} className='cursor-pointer text-[#077eff] font-semibold'><u>Click here</u></span></p>
          }
          {currentState === 'Login'
            ? <p className='text-[13px] text-[#5c5c5c]'>Forgot Password ? <span onClick={() => resetPassword(email)} className='cursor-pointer text-[#077eff] font-semibold'><u>Reset here</u></span></p>
            : null}
        </div>
      </form>
    </div>
  )
}

export default Login

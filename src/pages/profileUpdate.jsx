import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { appContext } from '../context/appContext'
import { toast } from 'react-toastify'
import Upload from '../lib/upload'
import { auth, db } from '../config/firebase'

const ProfileUpdate = () => {
  const { navigate, setUserData } = useContext(appContext)
  const [image, setImage] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [uid, setUid] = useState('')
  const [prevImage, setPrevImage] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (!prevImage && !image) {
        toast.error('Upload Profile Picture')
      }
      const docRef = doc(db, 'users', uid)
      if (image) {
        const imageUrl = await Upload(image)
        setPrevImage(imageUrl)
        await updateDoc(docRef, {
          avatar: imageUrl,
          bio,
          name,
        })
      }
      else {
        await updateDoc(docRef, {
          bio,
          name
        })
      }
      const snap = await getDoc(docRef)
      setUserData(snap.data())
      navigate('/chat')

    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        const docUser = docSnap.data()
        if (docUser.name) {
          setName(docUser.name)
        }
        if (docUser.bio) {
          setBio(docUser.bio)
        }
        if (docUser.avatar) {
          setPrevImage(docUser.avatar)
        }
      }
      else {
        navigate('/')
      }
    })
  }, [])
  return (
    <div className='min-h-[100vh] bg-[url(/background.png)] bg-no-repeat bg-cover flex items-center justify-center'>
      <div className='bg-white flex items-center justify-between min-w-[700px] rounded-[10px]'>
        <form onSubmit={onSubmitHandler} className='flex flex-col gap-[20px] p-[40px]' action="">
          <h3 className='text-2xl font-medium'>Profile Details</h3>
          <label className='flex items-center gap-[10px] text-[gray] cursor-pointer' htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} className='p-2.5 min-w-[300px] border-[#c9c9c9] border outline-[#077eff]' type="file" id='avatar' accept='.png , .jpg , .jpeg' hidden />
            <img className='w-[50px] aspect-square rounded-[50%]' src={image ? URL.createObjectURL(image) : assets.avatar_icon} alt="" />
            Upload profile image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} className='p-2.5 min-w-[300px] border-[#c9c9c9] border outline-[#077eff]' type="text" placeholder='Your name' required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} className='p-2.5 min-w-[300px] border-[#c9c9c9] border outline-[#077eff]' placeholder='Write profile bio' required></textarea>
          <button className='border-0 text-white bg-[#077eff] p-2 text-lg cursor-pointer' type='submit'>Save</button>
        </form>
        <img className='max-w-[160px] aspect-square my-[20px] mx-auto rounded-[50%]' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate

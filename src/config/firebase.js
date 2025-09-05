// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore'
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyDk8atkF7VFQUNiqNJKGAiCfyu56mjzPV8",
    authDomain: "chat-app-4d419.firebaseapp.com",
    projectId: "chat-app-4d419",
    storageBucket: "chat-app-4d419.firebasestorage.app",
    messagingSenderId: "260275515492",
    appId: "1:260275515492:web:0e8ce73b17713fb0a4af71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const db = getFirestore(app)

// signup
const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password) // สมัครผู้ใช้ใหม่ด้วย Firebase Auth 
        const user = res.user // res.user จะเป็น object ข้อมูลผู้ใช้ที่ Firebase สร้างให้ เช่น uid, email, accessToken
        await setDoc(doc(db, 'users', user.uid), { // บันทึกข้อมูล user ลง Firestore สร้าง document ใน collection users โดยใช้ user.uid เป็น document id
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: '',
            avatar: '',
            bio: 'Hey, There I am using chat app',
            lastSeen: Date.now()
        })
        await setDoc(doc(db, 'chats', user.uid), { //สร้าง collection chats สำหรับ user นั้น
            chatsData: [],
        })
    } catch (error) {
        console.log(error)
        toast.error(error.code.split('/').split('-').join(' '))
    }
}

//login 
const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        console.log(error)
        toast.error(error.code.split('/').split('-').join(' '))
    }
}

//signout
const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.log(error)
        toast.error(error.code.split('/').split('-').join(' '))
    }
}

const resetPassword = async (email) => {
    if (!email) {
        toast.error('Enter Your Email')
        return null
    }
    try {
        const userRef = collection(db, 'users')
        const q = query(userRef, where('email', '==', email))
        const querySnap = await getDocs(q)
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email)
            toast.success('Reset Email Sent')
        }
        else {
            toast.error("Email doesn't exists")
        }
    } catch (error) {
        toast.error(error.message)
    }
}
export { signup, login, logout, auth, db, resetPassword }
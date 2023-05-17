import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { auth } from '@/firebase'
import { useRouter } from 'next/router'

const AuthContext = createContext<any>({})
export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({
                    uid: user.uid,
                    email: user.email,
                })
            } else {
                setUser(null)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])
    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user
                router.push('/')
                // ...
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
            })
    }
    const logout = async () => {
        setUser(null)
        await signOut(auth)
        router.push('/Login')
    }
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}

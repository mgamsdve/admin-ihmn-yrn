import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

type Props = {}

function Login({}: Props) {
    const { user, login } = useAuth()
    const [error, setError] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (email === 'ihmnprivate.app@gmail.com') {
                await login(email, password)
            } else {
                setError(true)
            }
        } catch (error) {
            setError(true)
        }
    }
    return (
        <>
            <div className="flex items-center justify-center h-[100vh]">
                <form onSubmit={handleSubmit}>
                    <h1 className="items-center text-center justify-center text-4xl font-bold mb-5">
                        IHMN ADMIN
                    </h1>
                    <input
                        type="email"
                        className="my-Input"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="my-Input"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="bg-blue-500 text-white p-5 w-full rounded-md ">
                        Login
                    </button>
                    {error && (
                        <h3 className="text-red-500 text-center text-xl">
                            Wrong email or password
                        </h3>
                    )}
                </form>
            </div>
        </>
    )
}

export default Login

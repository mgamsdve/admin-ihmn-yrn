import Navigationbar from '@/Components/NavigationBar'
import ProtectedRoute from '@/Components/ProtectedRoute'
import { AuthContextProvider } from '@/context/AuthContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

const noAuthRequired = ['/Login']

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()

    return (
        <AuthContextProvider>
            <div className={`${router.pathname === '/Login' ? '' : 'flex'} `}>
                {router.pathname !== '/Login' && <Navigationbar />}
                {noAuthRequired.includes(router.pathname) ? (
                    <Component {...pageProps} />
                ) : (
                    <ProtectedRoute>
                        <Component {...pageProps} />
                    </ProtectedRoute>
                )}
            </div>
        </AuthContextProvider>
    )
}

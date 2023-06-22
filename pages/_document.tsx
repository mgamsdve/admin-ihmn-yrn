import Navigationbar from '@/Components/NavigationBar'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <meta name="google-site-verification" content="mg-duFqkJC9FdYQIJ7vQTpP4ASnGtDrlgYe-Ix4yCwM" />
            <title>Ihmn Admin</title>
            <link rel="icon" href="ihmnIcon.ico" />

            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

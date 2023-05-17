import Navigationbar from '@/Components/NavigationBar'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
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

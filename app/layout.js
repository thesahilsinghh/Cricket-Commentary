import '../styles/globals.css'

export const metadata = {
    title: 'Cricket Scoring App',
    description: 'Real-time cricket scoreboard and commentary',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

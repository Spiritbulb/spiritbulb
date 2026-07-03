import type { Metadata } from 'next'
import NuruClient from './nuru-client'

export const metadata: Metadata = {
    title: 'Join the Nuru Beta — Spiritbulb',
    description: 'Get early access to Nuru, the study companion that chats with your notes. Join the closed Android beta.',
}

export default function Page() {
    return <NuruClient />
}

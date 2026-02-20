import { useEffect, useState } from 'react'

export function useTypewriter(targetText: string, speed = 18) {
    const [displayed, setDisplayed] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        if (!targetText) {
            setDisplayed('')
            setIsTyping(false)
            return
        }

        setDisplayed('')
        setIsTyping(true)
        let i = 0

        const interval = setInterval(() => {
            i++
            setDisplayed(targetText.slice(0, i))
            if (i >= targetText.length) {
                clearInterval(interval)
                setIsTyping(false)
            }
        }, speed)

        return () => clearInterval(interval)
    }, [targetText, speed])

    return { displayed, isTyping }
}

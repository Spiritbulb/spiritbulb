import {
    AnimatedSpan,
    Terminal,
    TypingAnimation,
} from "@/components/ui/terminal"

export function HeroTerminal() {
    return (
        <Terminal>
            <TypingAnimation>Welcome to Spiritbulb</TypingAnimation>
            <AnimatedSpan>Checking current status...</AnimatedSpan>
            <AnimatedSpan>✓ Nuru</AnimatedSpan>
            <AnimatedSpan>✓ Reach</AnimatedSpan>
            <AnimatedSpan>✓ Menengai Cloud</AnimatedSpan>
            <AnimatedSpan>✓ Tufike</AnimatedSpan>
            <TypingAnimation>Loading video...</TypingAnimation>
            <AnimatedSpan>Error: Failed to load. Check your connection</AnimatedSpan>
        </Terminal>
    )
}

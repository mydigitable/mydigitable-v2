import { useRouter } from "next/navigation"
import styles from "./OnboardingProgress.module.css"

interface OnboardingProgressProps {
    completedSteps: number
}

const STEPS = [
    { id: 1, label: "Elegir tema", href: "/dashboard/settings" },
    { id: 2, label: "Tu perfil", href: "/dashboard/settings" },
    { id: 3, label: "Crear menú", href: "/dashboard/menu" },
    { id: 4, label: "Generar QR", href: "/dashboard/qr" },
    { id: 5, label: "Cobros Stripe", href: "/dashboard/settings/payments" },
]

export function OnboardingProgress({ completedSteps }: OnboardingProgressProps) {
    const router = useRouter()
    const progress = (completedSteps / 5) * 100

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Completa tu configuración</h3>
                <span className={styles.progress}>{completedSteps}/5 pasos</span>
            </div>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.steps}>
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => router.push(step.href)}
                        className={`${styles.step} ${step.id <= completedSteps ? styles.stepDone : ''}`}
                    >
                        {step.id <= completedSteps ? '✓' : step.id}
                        <span>{step.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

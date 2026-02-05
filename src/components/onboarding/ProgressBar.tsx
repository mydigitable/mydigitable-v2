"use client";

import { Check } from "lucide-react";

interface Props {
    currentStep: number;
    totalSteps: number;
    steps: { id: number; title: string }[];
}

export function ProgressBar({ currentStep, totalSteps, steps }: Props) {
    return (
        <div className="w-full">
            {/* Desktop - full progress */}
            <div className="hidden lg:flex items-center gap-1">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className="flex items-center"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step.id === currentStep
                                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                                    : step.id < currentStep
                                        ? "bg-primary/20 text-primary"
                                        : "bg-slate-100 text-slate-400"
                                }`}
                            title={step.title}
                        >
                            {step.id < currentStep ? (
                                <Check size={14} />
                            ) : (
                                step.id
                            )}
                        </div>
                        {step.id < totalSteps && (
                            <div className={`w-6 h-0.5 mx-0.5 ${step.id < currentStep ? "bg-primary/40" : "bg-slate-200"
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile - simple bar */}
            <div className="lg:hidden">
                <div className="flex gap-0.5">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`h-1 flex-1 rounded-full transition-all ${step.id <= currentStep ? "bg-primary" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>
                <p className="text-center text-xs text-slate-400 mt-2">
                    Paso {currentStep} de {totalSteps}: <span className="font-medium text-slate-600">{steps[currentStep - 1]?.title}</span>
                </p>
            </div>
        </div>
    );
}


import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-slate-200" />
                    <Skeleton className="h-4 w-48 bg-slate-200" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32 bg-slate-200 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white shadow-sm" />
                ))}
            </div>

            {/* Chart Skeleton */}
            <Skeleton className="h-[350px] w-full rounded-2xl bg-white shadow-sm" />

            {/* Split Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 bg-slate-200" />
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl bg-white shadow-sm" />
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48 bg-slate-200" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl bg-white shadow-sm" />
                    ))}
                </div>
            </div>
        </div>
    )
}

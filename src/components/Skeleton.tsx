import React from "react";

export function SkeletonLine({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) {
    return (
        <div className={`${width} ${height} bg-gray-200 rounded-full animate-pulse`} />
    );
}

export function SkeletonCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
            {children}
        </div>
    );
}

export function DiarySkeleton() {
    return (
        <div>
            {/* Macro summary */}
            <SkeletonCard>
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <SkeletonLine width="w-12" height="h-3" />
                            <SkeletonLine width="w-8" height="h-5" />
                            <SkeletonLine width="w-6" height="h-3" />
                        </div>
                    ))}
                </div>
            </SkeletonCard>

            {/* Meal sections */}
            {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i}>
                    <div className="flex justify-between items-center mb-3">
                        <SkeletonLine width="w-24" height="h-4" />
                        <SkeletonLine width="w-20" height="h-8" />
                    </div>
                    <div className="flex justify-between py-2 border-t">
                        <SkeletonLine width="w-32" height="h-4" />
                        <SkeletonLine width="w-16" height="h-4" />
                    </div>
                </SkeletonCard>
            ))}
        </div>
    );
}

export function WorkoutSkeleton() {
    return (
        <div>
            {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i}>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <SkeletonLine width="w-32" height="h-4" />
                            <SkeletonLine width="w-20" height="h-3" />
                        </div>
                        <SkeletonLine width="w-16" height="h-3" />
                    </div>
                </SkeletonCard>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2">
                        <SkeletonLine width="w-12" height="h-8" />
                        <SkeletonLine width="w-24" height="h-3" />
                    </div>
                ))}
            </div>

            {/* Chart card */}
            <SkeletonCard>
                <SkeletonLine width="w-32" height="h-4" />
                <div className="mt-4 h-44 bg-gray-100 rounded-lg animate-pulse" />
            </SkeletonCard>

            {/* List card */}
            <SkeletonCard>
                <SkeletonLine width="w-32" height="h-4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between py-2 border-t mt-2">
                        <SkeletonLine width="w-32" height="h-4" />
                        <SkeletonLine width="w-16" height="h-4" />
                    </div>
                ))}
            </SkeletonCard>
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div>
            {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i}>
                    <SkeletonLine width="w-32" height="h-4" />
                    <div className="mt-3 flex flex-col gap-3">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex flex-col gap-1">
                                <SkeletonLine width="w-20" height="h-3" />
                                <SkeletonLine width="w-full" height="h-9" />
                            </div>
                        ))}
                    </div>
                </SkeletonCard>
            ))}
        </div>
    );
}
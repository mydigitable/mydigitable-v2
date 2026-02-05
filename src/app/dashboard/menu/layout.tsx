"use client";

import { ReactNode } from "react";
import { MenuProvider, useMenu } from "@/contexts/MenuContext";
import { MenuPreview } from "@/components/dashboard/MenuPreview";

function MenuLayoutContent({ children }: { children: ReactNode }) {
    const { restaurant, categories, showPreview, setShowPreview } = useMenu();

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 w-full ${showPreview ? 'mr-0 lg:mr-[400px]' : ''}`}>
                {children}
            </div>

            {/* Global Preview Sidebar */}
            <MenuPreview
                restaurant={restaurant}
                categories={categories}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />
        </div>
    );
}

export default function MenuLayout({ children }: { children: ReactNode }) {
    return (
        <MenuProvider>
            <MenuLayoutContent>
                {children}
            </MenuLayoutContent>
        </MenuProvider>
    );
}

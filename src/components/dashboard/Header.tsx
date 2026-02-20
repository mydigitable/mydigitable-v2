"use client";

import { Bell, User, Search } from "lucide-react";

interface Props {
    userEmail: string;
}

export function Header({ userEmail }: Props) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:outline-none text-sm"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <Bell size={20} className="text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">Admin</p>
                        <p className="text-xs text-slate-500">{userEmail}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}

"use client";

import React from "react";

type Props = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
                        <p className="text-2xl mb-2">⚠️</p>
                        <h2 className="font-semibold text-lg mb-1">Something went wrong</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            {this.state.error?.message ?? "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
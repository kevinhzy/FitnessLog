type EmptyStateProps = {
    icon: string;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
};

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">{icon}</span>
            <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-ink-400" />
      </div>
      <h3 className="text-base font-medium text-ink-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

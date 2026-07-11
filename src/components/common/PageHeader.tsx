import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-zinc-400 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
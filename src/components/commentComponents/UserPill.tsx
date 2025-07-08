import { cn } from "../../lib/tailwind";

interface UserInitialPillProps {
  name: string;
  className?: string;
  style: React.CSSProperties;
}

export const UserPill = ({ name, className = "", style }: UserInitialPillProps) => {
  const initial = name?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <div className={cn("bg-blue-400 text-white p-0.5 px-2 h-fit capitalize rounded-full", className)} style={style}>
      {initial}
    </div>
  );
};

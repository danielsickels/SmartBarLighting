interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: "edit" | "delete" | "confirm" | "cancel";
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  edit: {
    base: "text-amber-500 border-amber-500/30",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.08))",
    shadow: "0 0 8px 1px rgba(153, 102, 0, 0.2)",
    hoverShadow: "0 0 15px 2px rgba(153, 102, 0, 0.35)",
  },
  delete: {
    base: "text-rose-400 border-rose-400/30",
    background: "linear-gradient(135deg, rgba(251, 113, 133, 0.05), rgba(225, 29, 72, 0.08))",
    shadow: "0 0 8px 1px rgba(225, 29, 72, 0.2)",
    hoverShadow: "0 0 15px 2px rgba(225, 29, 72, 0.35)",
  },
  confirm: {
    base: "text-white bg-emerald-700 hover:bg-emerald-800",
    background: "",
    shadow: "0 0 20px 3px rgba(0, 0, 0, 1)",
    hoverShadow: "0 0 25px 4px rgba(0, 0, 0, 1)",
  },
  cancel: {
    base: "text-white bg-gray-700 hover:bg-gray-600",
    background: "",
    shadow: "0 0 10px 2px rgba(0, 0, 0, 1)",
    hoverShadow: "0 0 15px 3px rgba(0, 0, 0, 1)",
  },
};

const sizeStyles = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-4 py-2 text-2xl",
};

const ActionButton = ({
  onClick,
  disabled = false,
  variant,
  children,
  size = "sm",
}: ActionButtonProps) => {
  const styles = variantStyles[variant];
  const isOutline = variant === "edit" || variant === "delete";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 font-bold rounded transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 ${
        styles.base
      } ${isOutline ? "border" : ""} ${sizeStyles[size]}`}
      style={{
        background: styles.background || undefined,
        boxShadow: styles.shadow,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = styles.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = styles.shadow;
      }}
    >
      {children}
    </button>
  );
};

export default ActionButton;


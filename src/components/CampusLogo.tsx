export default function CampusLogo({
  className = 'w-11 h-11',
  title = 'CampuStatus',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 58 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-foreground transition-colors duration-300 ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M55 8
           C32 8, 13 27, 13 50
           C13 73, 32 92, 55 92
           L55 76
           C40 76, 29 64, 29 50
           C29 36, 40 24, 55 24
           Z"
      />

      <circle cx="36" cy="34" r="7.2" fill="#E30613" />
      <circle cx="36" cy="50" r="7.2" fill="#FFCC00" />
      <circle cx="36" cy="66" r="7.2" fill="#00B050" />
    </svg>
  );
}

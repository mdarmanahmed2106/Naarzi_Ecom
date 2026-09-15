const SIZE_CLASSES = {
  sm: 'text-base',   // 16px – inline glyphs next to small/caption text
  md: 'text-xl',     // 20px – default UI icon size (buttons, list rows)
  lg: 'text-2xl',    // 24px – header/nav icons, modal close buttons
  xl: 'text-4xl',    // 36px – large decorative/empty-state icons
};

export default function Icon({ name, size = 'md', className = '', ...props }) {
  return (
    <span
      className={`material-symbols-outlined ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`.trim()}
      {...props}
    >
      {name}
    </span>
  );
}

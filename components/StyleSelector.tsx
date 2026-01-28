type StyleSelectorProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function StyleSelector({
  options,
  value,
  onChange,
}: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

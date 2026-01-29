type ImagePreviewProps = {
  title: string;
  imageUrl?: string;
  emptyText: string;
};

export default function ImagePreview({
  title,
  imageUrl,
  emptyText,
}: ImagePreviewProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-slate-400">{emptyText}</span>
        )}
      </div>
    </div>
  );
}

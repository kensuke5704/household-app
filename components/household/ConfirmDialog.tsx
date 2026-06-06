export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type ConfirmDialogState = (ConfirmOptions & {
  onResolve: (confirmed: boolean) => void;
}) | null;

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmOptions & {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] border border-[#e6dcc8] bg-white p-5 shadow-xl">
        <h2 className="text-lg font-black text-[#24190f]">{title}</h2>
        {message && (
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#6b7280]">
            {message}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#d7c7aa] bg-white px-4 py-3 text-sm font-black text-[#5b4630] active:bg-[#f3eadb]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#5b4630] px-4 py-3 text-sm font-black text-white active:scale-[0.99]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

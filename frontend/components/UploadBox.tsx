interface UploadBoxProps {
  title: string;
  description: string;
  status?: string;
  buttonText?: string;
}

export default function UploadBox({ title, description, status, buttonText = 'Choose file' }: UploadBoxProps) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
        <span className="text-2xl">📄</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {buttonText}
        </button>
        {status ? (
          <p className="text-sm text-gray-500">{status}</p>
        ) : (
          <p className="text-sm text-gray-500">Drag and drop a PDF or select a file</p>
        )}
      </div>
    </div>
  );
}

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Ocorreu um erro no aplicativo</h1>
      <p className="text-slate-600 mb-6 max-w-md">
        {error.message || 'Tivemos um problema ao carregar esta página.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Tentar novamente
      </button>
    </div>
  );
}

'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-2">404 - Página Não Encontrada</h1>
      <p className="text-slate-600 mb-6">A página que você está procurando não existe ou foi movida.</p>
      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}

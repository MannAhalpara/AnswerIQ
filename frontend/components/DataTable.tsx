'use client';

import { ReactNode } from 'react';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export default function DataTable({ children, className = '' }: DataTableProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white ${className}`}>
      <table className="min-w-full">{children}</table>
    </div>
  );
}

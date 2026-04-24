'use client';

import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export default function SearchInput({ containerClassName = '', className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 ${className}`}
        {...props}
      />
    </div>
  );
}

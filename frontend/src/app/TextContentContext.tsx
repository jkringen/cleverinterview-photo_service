'use client';

import React, { createContext, useContext } from 'react';

type TextContent = Record<string, Array<{ type: string; text: string }>> | null;

const TextContentContext = createContext<TextContent | null>(null);

export function TextContentProvider({ value, children }: { value: TextContent; children: React.ReactNode }) {
  return <TextContentContext.Provider value={value}>{children}</TextContentContext.Provider>;
}

export function useTextContent() {
  const ctx = useContext(TextContentContext);
  if (!ctx) throw new Error('useTextContent must be used within TextContentProvider');
  return ctx;
}

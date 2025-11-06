'use client';

import { useEffect, useState } from 'react';
import { getRandomQuote, type Quote } from '@/lib/quotes';

export function RandomQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Set random quote on client side to avoid hydration mismatch
    setQuote(getRandomQuote());
  }, []);

  if (!quote) {
    // Return placeholder with same structure to prevent layout shift
    return (
      <div className="opacity-0">
        <p className="text-sm text-[#71717A] italic font-serif">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground/50 italic font-serif max-w-2xl mx-auto leading-relaxed">
        "{quote.text}"
      </p>
      <p className="text-xs text-foreground/40 mt-2">— {quote.author}</p>
    </div>
  );
}
'use client';

export default function Vignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, rgba(15, 15, 16, 0) 70%)'
      }}
    />
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        {/* Animated gradient swipe effect */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#D4AF37] border-r-amber-400 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 opacity-20 animate-pulse"></div>
          </div>

          <div className="text-foreground font-serif text-lg">
            Loading...
          </div>

          {/* Gradient swipe bar */}
          <div className="w-48 h-1 bg-[#18181B]/60 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes swipe {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}

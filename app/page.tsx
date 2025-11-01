export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%)',
              boxShadow: '0 0 60px rgba(212, 175, 55, 0.2)'
            }}>
              <svg
                className="w-14 h-14 text-[#D4AF37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-[#E4E4E7] mb-6 tracking-wide">
            The Book Circle
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] mb-4 max-w-2xl mx-auto font-light italic">
            Where stories come alive through shared discovery
          </p>

          <p className="text-base text-[#71717A] max-w-3xl mx-auto leading-relaxed">
            Suggest books, cast your vote, track reading progress, and gather for thoughtful discussions.
            Your literary journey begins here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <a
              href="/auth/register"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)'
              }}
            >
              Begin Your Journey
            </a>
            <a
              href="/auth/login"
              className="bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] font-semibold py-3 px-10 rounded-full border border-[#3F3F46] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A78BFA]"
            >
              Return to Library
            </a>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-[#18181B]/60 backdrop-blur-lg p-8 rounded-3xl border border-[#3F3F46] hover:border-[#A78BFA]/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#4F46E5]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#4F46E5]/20 transition-colors">
              <svg className="w-7 h-7 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#E4E4E7] mb-3">Suggest & Vote</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Each cycle, members propose their favorite reads. The circle votes, and the story begins.
            </p>
          </div>

          <div className="bg-[#18181B]/60 backdrop-blur-lg p-8 rounded-3xl border border-[#3F3F46] hover:border-[#A78BFA]/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#A78BFA]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#A78BFA]/20 transition-colors">
              <svg className="w-7 h-7 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#E4E4E7] mb-3">Gather & Discuss</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Schedule meetings, share insights, and explore the depths of each narrative together.
            </p>
          </div>

          <div className="bg-[#18181B]/60 backdrop-blur-lg p-8 rounded-3xl border border-[#3F3F46] hover:border-[#A78BFA]/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
              <svg className="w-7 h-7 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#E4E4E7] mb-3">Track Progress</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Break books into chapters, monitor your pace, and celebrate milestones as one.
            </p>
          </div>
        </div>

        {/* Literary quote */}
        <div className="mt-20 text-center">
          <p className="text-sm text-[#71717A] italic font-serif max-w-2xl mx-auto leading-relaxed">
            "Books are a uniquely portable magic. In them, we find mirrors of ourselves and windows into worlds unknown."
          </p>
        </div>
      </div>
    </main>
  )
}
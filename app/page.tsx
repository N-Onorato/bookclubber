export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Book Club Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your book club suggestions, voting, and reading sessions
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </a>
            <a
              href="/auth/register"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
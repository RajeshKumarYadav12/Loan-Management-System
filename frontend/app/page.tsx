import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      
      {/* Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="z-10 w-full max-w-5xl text-center flex flex-col items-center gap-8">
        
        {/* Hero Section */}
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 md:p-16 shadow-2xl">

          <div className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/10 text-sm font-medium text-white/80 mb-6">
            ✨ Next Generation Lending Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
            Smart Loans.
            <br />
            Simple Process.
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience a seamless, fully digital loan journey. Apply in minutes,
            get instant decisions, and manage everything from our premium dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-lg flex items-center gap-2"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition font-semibold text-lg"
            >
              Staff Portal
            </Link>

          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <h3 className="text-xl font-semibold mb-3">
              Lightning Fast
            </h3>

            <p className="text-gray-400 text-sm">
              Automated business rules engine gives instant application feedback.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <h3 className="text-xl font-semibold mb-3">
              Secure & Private
            </h3>

            <p className="text-gray-400 text-sm">
              Bank-grade encryption for all your documents and data.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <h3 className="text-xl font-semibold mb-3">
              Flexible Terms
            </h3>

            <p className="text-gray-400 text-sm">
              Customize your loan amount and tenure up to 365 days.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
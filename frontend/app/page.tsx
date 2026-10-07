import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-rose-100 text-slate-900">
      <nav className="flex items-center justify-between border-b border-rose-900 bg-rose-200 px-8 py-5">
        <Link
          href="/"
          className="text-xl font-bold text-blue-900"
        >
          Rosa banken
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-rose-700"
          >
            Hem
          </Link>

          <Link
            href="/login"
            className="hover:text-rose-700"
          >
            Logga in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-sky-900 px-4 py-2 text-white hover:bg-sky-800"
          >
            Skapa användare
          </Link>
        </div>
      </nav>

      <main className="flex min-h-[80vh] items-center justify-center px-6">
        <section className="max-w-xl text-center">
          <h1 className=" text-5xl font-bold tracking-tight">Rosa banken</h1>
          <p className="mb-5">Banken för dig med stil och klass!</p>

          <p className="mb-8 text-lg text-slate-600">Vi hjälper dig skapa ett bankkonto, se saldo samt hantera dina pengar.</p>

          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-sky-900 px-6 py-3 font-medium text-white hover:bg-sky-800"
            >
              Skapa användare
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-blue-900 px-6 py-3 font-medium 
              bg-rose-200 text-blue-900 hover:bg-rose-100"
            >
              Logga in
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

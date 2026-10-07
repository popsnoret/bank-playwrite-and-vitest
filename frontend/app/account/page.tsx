"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const [amount, setAmount] = useState(0);
  const [deposit, setDeposit] = useState("");

  useEffect(() => {
    async function getAccount() {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/me/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAmount(data.amount);
      }
    }

    getAccount();
  }, []);

  async function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/me/accounts/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        amount: Number(deposit),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setAmount(data.amount);
      setDeposit("");
    }
  }

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
        <section className="w-full max-w-xl text-center">
          <h1 className="mb-2 text-5xl font-bold tracking-tight">Mitt konto</h1>

          <p className="mb-8 text-lg text-slate-600">Här kan du se ditt saldo och sätta in pengar.</p>

          <div className="mb-8 rounded-lg bg-rose-200 p-8">
            <p className="text-lg">Saldo</p>
            <p className="text-4xl font-bold text-blue-900">{amount} kr</p>
          </div>

          <form
            onSubmit={handleDeposit}
            className="flex flex-col gap-4"
          >
            <label
              htmlFor="deposit"
              className="font-medium"
            >
              Belopp
            </label>

            <input
              id="deposit"
              type="number"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
              className="rounded-lg border border-rose-900 bg-white px-4 py-3"
            />

            <button
              type="submit"
              className="rounded-lg bg-sky-900 px-6 py-3 font-medium text-white hover:bg-sky-800"
            >
              Sätt in pengar
            </button>
          </form>
          <Link
            href="/transactions"
            className="mt-6 inline-block rounded-lg bg-rose-900 px-6 py-3 font-medium text-white hover:bg-rose-800"
          >
            Visa transaktioner
          </Link>
        </section>
      </main>
    </div>
  );
}

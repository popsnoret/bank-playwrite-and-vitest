"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Transaction = {
  id: number;
  amount: number;
  createdAt: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getTransactions() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Du måste vara inloggad för att se dina transaktioner.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/me/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Kunde inte hämta transaktionerna.");
          return;
        }

        const data = await response.json();
        setTransactions(data.transactions);
      } catch {
        setError("Kunde inte ansluta till banken.");
      } finally {
        setLoading(false);
      }
    }

    getTransactions();
  }, []);

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
            href="/account"
            className="hover:text-rose-700"
          >
            Mitt konto
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="mb-2 text-4xl font-bold">Transaktioner</h1>

        <p className="mb-8 text-slate-600">Här ser du dina senaste insättningar.</p>

        {loading && <p>Laddar transaktioner...</p>}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-100 p-4 text-red-800"
          >
            {error}
          </p>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="rounded-lg bg-rose-200 p-8 text-center">
            <p className="text-lg font-medium">Du har inga transaktioner ännu.</p>
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="font-medium">Insättning</p>
                  <p className="text-sm text-slate-500">{new Date(transaction.createdAt).toLocaleString("sv-SE")}</p>
                </div>

                <p className="text-lg font-bold text-blue-900">+{transaction.amount} kr</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

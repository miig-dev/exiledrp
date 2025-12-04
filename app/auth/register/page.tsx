"use client";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      <form className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="px-4 py-2 rounded bg-[#23272A] text-white"
        />
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded bg-[#23272A] text-white"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="px-4 py-2 rounded bg-[#23272A] text-white"
        />
        <button
          type="submit"
          className="bg-[#19BFFF] text-white font-bold py-2 rounded hover:bg-[#0ea5e9] transition"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}

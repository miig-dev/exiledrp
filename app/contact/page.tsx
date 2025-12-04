"use client";

export default function Contact() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white">
      <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
        <h1 className="text-3xl font-bold text-[#19BFFF] mb-4 text-center">
          Contact
        </h1>
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom"
            className="px-4 py-2 rounded bg-[#23272A] text-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded bg-[#23272A] text-white"
          />
          <textarea
            placeholder="Message"
            className="px-4 py-2 rounded bg-[#23272A] text-white min-h-[120px]"
          />
          <button
            type="submit"
            className="bg-[#19BFFF] text-white font-bold py-2 rounded hover:bg-[#0ea5e9] transition"
          >
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}

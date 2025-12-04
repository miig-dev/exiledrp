import Image from "next/image";

export default function Direction() {
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-10 w-full max-w-2xl mx-auto flex flex-col items-center">
      <Image
        src="/public/logoex.png"
        alt="Logo ExiledRP"
        width={80}
        height={80}
        className="mb-4 w-20 h-20"
        priority
      />
      <h1 className="text-xl sm:text-2xl font-bold text-[#19BFFF] mb-4 text-center sm:text-left">
        Pôle Direction
      </h1>
      <p className="text-gray-300 text-base sm:text-lg text-center sm:text-left">
        Accès global, maintenance, logs, visualisation…
      </p>
    </main>
  );
}

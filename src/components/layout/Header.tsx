import Link from "next/link";

import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b border-[#23272A] py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <div className="flex items-center gap-3">
        <Image
          src="/assets/img/logo-exiledrp.png"
          alt="Logo Exiled RP"
          width={40}
          height={40}
          className="w-10 h-10"
          priority
        />
        <span className="text-xl font-bold text-[#19BFFF] text-center sm:text-left">
          EXILED RP
        </span>
      </div>
      <nav className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-6 text-sm font-medium">
        <Link href="/" className="hover:text-[#19BFFF]">
          Accueil
        </Link>
        <Link href="/reglement" className="hover:text-[#19BFFF]">
          Règles
        </Link>
        <Link href="/fiches-personnages" className="hover:text-[#19BFFF]">
          Personnage
        </Link>
        <Link href="/staff" className="hover:text-[#19BFFF]">
          Notre Équipe
        </Link>
        <Link href="/boutique" className="hover:text-[#19BFFF]">
          Boutique
        </Link>
        <Link href="/candidature" className="hover:text-[#19BFFF]">
          Nous rejoindre
        </Link>
        <Link href="#" className="hover:text-[#19BFFF]">
          Se connecter
        </Link>
        <Link href="#" className="hover:text-[#19BFFF]">
          S'inscrire
        </Link>
      </nav>
    </header>
  );
}

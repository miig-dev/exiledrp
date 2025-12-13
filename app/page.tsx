"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  // Menu responsive state
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/reglement", label: "Règles" },
    { href: "/fiches-personnages", label: "Personnage" },
    { href: "/staff", label: "Notre Équipe" },
    { href: "/boutique", label: "Boutique" },
    { href: "/candidature", label: "Nous rejoindre" },
  ];

  return (
    <div className="min-h-screen bg-[#181A1B] text-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#23272A] py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 relative">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Image
            src="/logoex.png"
            alt="Logo Exiled RP"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="text-xl font-bold text-[#19BFFF] text-center sm:text-left whitespace-nowrap">
            EXILED RP
          </span>
        </div>
        {/* Hamburger pour mobile */}
        <button
          className="sm:hidden absolute right-4 top-4 z-20 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#19BFFF]"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="block w-6 h-6">
            {/* Hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#19BFFF"
              className="w-6 h-6"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </span>
        </button>
        {/* Menu navigation */}
        <nav
          className={`
            flex-col sm:flex-row flex-wrap justify-center sm:justify-end text-sm font-medium w-full sm:w-auto
            gap-0 sm:gap-6
            absolute sm:static left-0 right-0 top-full sm:top-auto bg-[#181A1B] sm:bg-transparent z-10
            transition-all duration-300
            ${menuOpen ? "flex animate-fade-in" : "hidden sm:flex"}
            sm:items-center
            py-0 sm:py-0
            shadow-lg sm:shadow-none
          `}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                `hover:text-[#19BFFF] w-full sm:w-auto text-center px-4 py-3 border-b border-[#23272A] last:border-b-0 sm:border-none sm:py-0 sm:px-0` +
                (menuOpen ? "" : "")
              }
              style={menuOpen ? { transition: "all 0.2s" } : {}}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Bouton unique Discord */}
          <button
            onClick={() => (window.location.href = "/auth/signin")}
            className="w-full sm:w-auto text-center px-4 py-3 bg-[#5865F2] text-white font-bold rounded hover:bg-[#4752C4] transition border-b border-[#23272A] last:border-b-0 sm:border-none sm:py-0 sm:px-0"
            style={menuOpen ? { transition: "all 0.2s" } : {}}
          >
            Connexion Discord
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="mt-8 sm:mt-16 mb-8 text-center w-full max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#19BFFF] mb-2">
            Exiled RP [WL]
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-6">
            Un RP cyberpunk réaliste, immersif, et communautaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full max-w-md mx-auto">
            <a
              href="#"
              className="px-6 py-2 rounded-lg bg-[#19BFFF] text-white font-semibold hover:bg-[#0ea5e9] transition w-full sm:w-auto"
            >
              Rejoindre Discord
            </a>
            <a
              href="#"
              className="px-6 py-2 rounded-lg bg-[#23272A] text-white font-semibold hover:bg-[#2c3136] transition w-full sm:w-auto"
            >
              Se connecter
            </a>
          </div>
          <section className="mb-16 w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Le rôleplay :</h2>
            <p className="text-gray-300 mb-2">
              Le Roleplay (ou jeu de rôle, en français) est une activité où une
              ou plusieurs personnes incarnent un personnage et jouent son rôle
              dans un univers imaginaire, en interagissant avec d’autres
              personnages selon les règles et la logique de cet univers.
            </p>
            <p className="text-gray-400">
              Le mot vient de l’anglais rôle (rôle) et play (jouer) —
              littéralement : jouer un rôle.
            </p>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-16">
            <div className="bg-[#23272A] rounded-lg p-6 flex flex-col items-center shadow">
              <span className="mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-[#19BFFF]">
                {/* Bouclier SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 3l7 4v5c0 5.25-3.5 9.74-7 10-3.5-.26-7-4.75-7-10V7l7-4z"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-lg mb-2">Sécurité & Fairplay</h3>
              <p className="text-gray-300 text-center">
                Un staff actif et des outils performants pour garantir une
                expérience de jeu saine.
              </p>
            </div>
            <div className="bg-[#23272A] rounded-lg p-6 flex flex-col items-center shadow">
              <span className="mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-[#19BFFF]">
                {/* Outils SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 7l-1.41-1.41a2 2 0 0 0-2.83 0l-7.76 7.76a2 2 0 0 0 0 2.83L7 17m10-10l2 2m-2-2l-2 2"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-lg mb-2">Métiers Avancés</h3>
              <p className="text-gray-300 text-center">
                Des scripts exclusifs et un système de gestion poussé pour tous
                les métiers.
              </p>
            </div>
            <div className="bg-[#23272A] rounded-lg p-6 flex flex-col items-center shadow">
              <span className="mb-4 flex items-center justify-center w-10 h-10 rounded-full bg-[#19BFFF]">
                {/* Bulle de discussion SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-lg mb-2">Communauté Active</h3>
              <p className="text-gray-300 text-center">
                Des événements réguliers et une communauté soudée sur Discord.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

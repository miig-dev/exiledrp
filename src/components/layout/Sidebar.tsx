"use client";
import Link from "next/link";
import { useState } from "react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-[#23272A] text-white p-4 border-r border-[#23272A]">
        <nav className="flex flex-col gap-4">
          <Link href="/ios" className="hover:text-[#19BFFF] font-semibold">
            Dashboard
          </Link>
          <Link href="/ios/mail" className="hover:text-[#19BFFF]">
            Messagerie
          </Link>
          <Link href="/ios/animation-center" className="hover:text-[#19BFFF]">
            Animation Center
          </Link>
          <Link href="/ios/profession-center" className="hover:text-[#19BFFF]">
            Pôle Métiers
          </Link>
          <Link href="/ios/emergency-live" className="hover:text-[#19BFFF]">
            UrgenceLive
          </Link>
          <Link href="/ios/staff-center" className="hover:text-[#19BFFF]">
            Staff Center
          </Link>
          <Link href="/ios/gestion" className="hover:text-[#19BFFF]">
            Gestion
          </Link>
          <Link href="/ios/direction" className="hover:text-[#19BFFF]">
            Direction
          </Link>
        </nav>
      </aside>

      {/* Sidebar mobile : bouton menu + drawer */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#19BFFF] text-white rounded-full p-2 shadow-lg"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setIsOpen(false)}
        >
          <aside
            className="fixed top-0 left-0 h-full w-64 bg-[#23272A] text-white p-6 flex flex-col gap-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-[#19BFFF]"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/ios"
                className="hover:text-[#19BFFF] font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/ios/mail"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Messagerie
              </Link>
              <Link
                href="/ios/animation-center"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Animation Center
              </Link>
              <Link
                href="/ios/profession-center"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Pôle Métiers
              </Link>
              <Link
                href="/ios/emergency-live"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                UrgenceLive
              </Link>
              <Link
                href="/ios/staff-center"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Staff Center
              </Link>
              <Link
                href="/ios/gestion"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Gestion
              </Link>
              <Link
                href="/ios/direction"
                className="hover:text-[#19BFFF]"
                onClick={() => setIsOpen(false)}
              >
                Direction
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

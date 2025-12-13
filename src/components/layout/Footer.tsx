export const Footer = () => {
  return (
    <footer className="mt-10 w-full border-t border-neutral-800 bg-[#181A1B] py-6 text-center text-sm text-neutral-400">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between">
        <span>
          &copy; {new Date().getFullYear()} ExiledRP. Tous droits réservés.
        </span>
        <span>
          Développé par{" "}
          <a
            href="https://github.com/Igor-MigDev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Igor_MigDev
          </a>
        </span>
      </div>
    </footer>
  );
};

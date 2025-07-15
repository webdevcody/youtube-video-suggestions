export function Footer() {
  return (
    <footer className="h-40 border-t-2 border-gray-100 dark:border-gray-900">
      <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
        <div className="font-semibold text-lg  flex flex-col gap-2">
          <div>Logo</div>
          <a
            href="mailto:info@videosuggestions.com"
            className="hover:underline"
          >
            info@videosuggestions.com
          </a>
        </div>
        <nav className="flex flex-wrap gap-4 items-center">
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="hover:underline">
            Terms of Service
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

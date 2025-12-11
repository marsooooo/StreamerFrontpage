import LegalSection from "@/components/legal-section"
import { AnimatedBackground } from "@/components/animated-background"
import Link from "next/link"

export default function LegalPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">
      <AnimatedBackground />

      <div className="relative z-10">
        <div className="pt-8 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour
          </Link>
        </div>

        <LegalSection />

        <footer className="mt-16 pb-8 flex items-center justify-center gap-3 text-sm font-medium text-white/30">
          <span>Développé par marso</span>
          <a
            href="https://github.com/marsooooo/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300 inline-flex items-center"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 align-middle">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56v-2.18c-3.2.7-3.87-1.55-3.87-1.55-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.68 5.4-5.24 5.68.42.37.8 1.1.8 2.22v3.29c0 .31.21.67.8.56A10.98 10.98 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
          </a>
        </footer>
      </div>
    </div>
  )
}

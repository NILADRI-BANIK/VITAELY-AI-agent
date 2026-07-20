import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VITAELY - AI Career Coach",
  description: "Your AI-powered career coaching assistant",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            <main className="min-h-screen">{children}</main>

            <Toaster richColors />

            {/* ================= FOOTER ================= */}

            <footer className="border-t border-white/10 bg-[#05060A]">
              <div className="container mx-auto px-6 py-6">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                  {/* Brand */}

                  <div>
                    <h2 className="font-norse text-5xl tracking-[0.25em] text-white">
                      VITAELY
                    </h2>

                    <p className="mt-5 text-gray-400 leading-8">
                      AI-powered Career Assistant helping students and
                      professionals build resumes, optimize ATS scores,
                      generate portfolios, prepare for interviews and
                      accelerate career growth with Artificial Intelligence.
                    </p>
                  </div>

                  {/* Founders */}

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5">
                      Founders
                    </h3>

                    <div className="space-y-6">

                      <div>
                        <h4 className="text-white font-medium">
                          Niladri Banik
                        </h4>

                        <a
                          href="https://github.com/NILADRI-BANIK/VITAELY-AI-agent"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6C63FF] hover:text-[#00E5A0] transition"
                        >
                          GitHub Repository
                        </a>
                      </div>

                      <div>
                        <h4 className="text-white font-medium">
                          Anushka Roy
                        </h4>

                        <a
                          href="https://github.com/AnushkaRoy035"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6C63FF] hover:text-[#00E5A0] transition"
                        >
                          GitHub Profile
                        </a>
                      </div>

                    </div>
                  </div>

                  {/* Features */}

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5">
                      Features
                    </h3>

                    <ul className="space-y-3 text-gray-400">
                      <li>AI Resume Builder</li>
                      <li>ATS Resume Checker</li>
                      <li>Portfolio Generator</li>
                      <li>AI Cover Letter</li>
                      <li>Interview Preparation</li>
                      <li>Skill Gap Analysis</li>
                    </ul>
                  </div>

                  {/* Contact */}

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-5">
                      Contact
                    </h3>

                    <div className="space-y-4 text-gray-400">

                      <p>
                        Laketown, Kolkata, West Bengal, India
                      </p>

                      <p>
                        Niladri Banik
                        <br />
                        +91 93303 20085
                      </p>

                      <p>
                        Anushka Roy
                        <br />
                        +91 98366 11720
                      </p>

                    </div>
                  </div>

                </div>

                {/* Bottom */}

                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} VITAELY. All Rights Reserved.
                  </p>

                  <p className="text-gray-500 text-sm text-center">
                    Designed & Developed with ❤️ by{" "}
                    <span className="text-white font-medium">
                      Nil
                    </span>{" "}
                    &{" "}
                    <span className="text-white font-medium">
                      Anu
                    </span>
                  </p>

                </div>

              </div>
            </footer>

            {/* =========================================== */}

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
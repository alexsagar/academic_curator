import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "The Academic Curator | Elevate Your Student Portfolio",
  description:
    "Transform your academic journey into a professional visual gallery. The high-end portfolio builder designed specifically for the modern student.",
  keywords: [
    "academic portfolio",
    "student portfolio builder",
    "digital portfolio",
    "academic curator",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/en.json`)).default;
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

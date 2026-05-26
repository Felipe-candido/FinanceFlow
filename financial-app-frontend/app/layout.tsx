import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next' // Só mantenha se for usar Vercel
import './globals.css'
// Importe seus providers aqui (ex: ThemeProvider, AuthProvider)

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

// 1. APROVEITE O METADATA (Traduzi para ficar alinhado com sua copy)
export const metadata: Metadata = {
  title: 'FinanceFlow | Organize seu dinheiro em 5 minutos',
  description: 'Descubra exatamente pra onde seu salário está indo sem planilhas, sem bagunça e sem dor de cabeça.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 2. APROVEITE O lang="pt-BR"
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      
      {/* 3. MANTENHA AS CLASSES LIMPAS PARA O TEMA FUNCIONAR */}
      <body className="font-sans antialiased bg-background text-foreground">
        
        {/* Envolva o children com seus Providers que já existiam no projeto */}
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          {children}
        {/* </ThemeProvider> */}

        {/* 4. APROVEITE O ANALYTICS (Se for hospedar na Vercel) */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
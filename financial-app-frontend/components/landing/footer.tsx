"use client"

import Link from "next/link"
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react"

const footerLinks = {
  product: {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#" },
      { label: "Preços", href: "#plans" },
      { label: "Integrações", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Changelog", href: "#" }
    ]
  },
  company: {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Imprensa", href: "#" },
      { label: "Parceiros", href: "#" }
    ]
  },
  resources: {
    title: "Recursos",
    links: [
      { label: "Central de Ajuda", href: "#" },
      { label: "Documentação", href: "#" },
      { label: "Tutoriais", href: "#" },
      { label: "Webinars", href: "#" },
      { label: "Comunidade", href: "#" }
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "LGPD", href: "#" },
      { label: "Segurança", href: "#" }
    ]
  }
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" }
]

export function Footer() {
  return (
    <footer className="relative bg-[#0a1f15] border-t border-[#1f5c3d]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg
                  viewBox="0 0 40 40"
                  className="w-8 h-8"
                  fill="none"
                >
                  <rect x="4" y="8" width="32" height="24" rx="3" stroke="#a3e635" strokeWidth="2" />
                  <circle cx="20" cy="20" r="6" stroke="#22d3ee" strokeWidth="2" />
                  <path d="M20 16v8M16 20h8" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Finance<span className="text-[#a3e635]">Flow</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              A plataforma mais completa para você dominar suas finanças pessoais com clareza e segurança.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-[#143d29] flex items-center justify-center text-gray-400 hover:bg-[#a3e635]/20 hover:text-[#a3e635] transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-[#a3e635] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#1f5c3d]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Rendeu. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
              Todos os sistemas operacionais
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

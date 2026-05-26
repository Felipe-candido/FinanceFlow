"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "MÓDULOS", href: "#modules" },
  { label: "PLANOS", href: "#plans" },
  { label: "COMUNIDADE", href: "#community" },
  { label: "COMO FUNCIONA", href: "#how-it-works" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1f15]/90 backdrop-blur-md border-b border-[#1f5c3d]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#a3e635]/20 rounded-lg blur-sm" />
              <svg
                viewBox="0 0 40 40"
                className="w-10 h-10 relative z-10"
                fill="none"
              >
                <rect x="4" y="8" width="32" height="24" rx="3" stroke="#a3e635" strokeWidth="2" />
                <circle cx="20" cy="20" r="6" stroke="#22d3ee" strokeWidth="2" />
                <path d="M20 16v8M16 20h8" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              Finance<span className="text-[#a3e635]">Flow</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-[#a3e635] transition-colors tracking-wider"
              >
                [ {item.label} ]
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              asChild
              className="bg-transparent border-2 border-[#a3e635] text-[#a3e635] hover:bg-[#a3e635] hover:text-[#0a1f15] font-semibold px-6 tracking-wider transition-all duration-300"
            >
              <Link href="/register">
                [ Teste Grátis ]
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#1f5c3d]/30">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-gray-300 hover:text-[#a3e635] transition-colors tracking-wider"
                >
                  [ {item.label} ]
                </Link>
              ))}
              <Button 
                className="mt-2 bg-[#a3e635] text-[#0a1f15] hover:bg-[#84cc16] font-semibold tracking-wider"
              >
                [ FREE TRIAL ]
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

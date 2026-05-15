// NewHomepageWrapper — monta a nova homepage completa com contextos necessários
// Usado pela Onda 4 atrás de ?new=1. NÃO importar em prod sem feature flag.

import React, { useState, useCallback } from 'react'
import { NavContext, ToastProvider } from './_primitives'
import NavbarNew from './Navbar.new'
import HeroNew from './Hero.new'
import ComoFuncionaNew from './ComoFunciona.new'
import CarrosselEstilosNew from './CarrosselEstilos.new'
import BeneficiosNew from './Beneficios.new'
import ParaQuemNew from './ParaQuem.new'
import GaleriaNew from './Galeria.new'
import LojaNew from './Loja.new'
import FaqNew from './Faq.new'
import { Footer as FooterNew, PremiumCTA } from './PremiumFooter.new'

export default function NewHomepageWrapper() {
  const [page, setPage] = useState('home')

  const go = useCallback((p: string) => setPage(p), [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleUpload = useCallback(() => {
    // Em Onda 5, vai abrir o fluxo de upload + geração.
    // Por ora, redireciona para /diagnostico (fluxo existente).
    window.location.href = '/diagnostico'
  }, [])

  const handleExplore = useCallback(() => {
    scrollTo('carrossel-estilos')
  }, [scrollTo])

  return (
    <NavContext.Provider value={{ page, go, scrollTo }}>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--background)]">
          <NavbarNew />
          <main id="main-content">
            <HeroNew onUpload={handleUpload} onExplore={handleExplore} />
            <ComoFuncionaNew onStart={handleUpload} />
            <div id="carrossel-estilos">
              <CarrosselEstilosNew onSelectStyle={handleUpload} onUpload={handleUpload} />
            </div>
            <BeneficiosNew />
            <ParaQuemNew />
            <GaleriaNew />
            <LojaNew />
            <FaqNew />
            <PremiumCTA />
          </main>
          <FooterNew />
        </div>
      </ToastProvider>
    </NavContext.Provider>
  )
}

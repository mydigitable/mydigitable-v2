"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  Smartphone,
  QrCode,
  CreditCard,
  BarChart3,
  Globe2,
  Zap,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Play,
  Menu,
  Sparkles,
  TrendingUp,
  Users,
  Bell,
  Palette,
  Languages,
  HeartHandshake,
  HelpCircle,
  Plus,
} from "lucide-react";

// ============================================
// COMPONENTES DE ANIMACIÓN REUTILIZABLES
// ============================================

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// NAVBAR
// ============================================

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-semibold text-xl text-foreground">MyDigitable</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-[15px] font-medium">
                Funciones
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-[15px] font-medium">
                Precios
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-[15px] font-medium">
                Testimonios
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors text-[15px] font-medium">
                FAQ
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-full bg-primary text-white text-[15px] font-medium hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6"
            >
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2">
                <X className="w-6 h-6" />
              </button>
              <div className="mt-16 space-y-6">
                <a href="#features" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Funciones</a>
                <a href="#pricing" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Precios</a>
                <a href="#testimonials" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonios</a>
                <a href="#faq" className="block text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <hr className="my-6" />
                <Link href="/login" className="block text-lg text-muted-foreground">Iniciar sesión</Link>
                <Link href="/register" className="block w-full py-3 px-6 bg-primary text-white text-center rounded-full font-medium">
                  Empezar gratis
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-accent/25 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-[100px]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>+500 restaurantes ya confían en nosotros</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-foreground mb-8"
          >
            <span className="block">El menú digital</span>
            <span className="block mt-2">
              que tu restaurante{" "}
              <span className="gradient-text animate-gradient-shift">merece</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Digitaliza tu restaurante en minutos con nuestra plataforma experta. <span className="text-primary font-normal">Sin complicaciones, solo resultados.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-lg font-medium hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 hover:scale-105"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-foreground text-lg font-medium border-2 border-primary/20 hover:border-primary transition-all hover:shadow-xl"
            >
              <Play className="w-5 h-5 text-primary" />
              Ver demo
            </a>
          </motion.div>
        </div>

        {/* Hero Image/Mockup ARREGLADO CON IMAGENES REALES */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 relative"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[40px] blur-3xl opacity-50" />

            <div className="relative bg-white rounded-[32px] shadow-2xl shadow-black/10 border border-black/5 overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 bg-muted/50 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-lg bg-white text-xs text-muted-foreground border border-border">
                    mydigitable.com/dashboard
                  </div>
                </div>
              </div>

              <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
                {/* Main Image Replacement - VISIBILIDAD MEJORADA */}
                <img src="/dashboard_preview.png" className="w-full h-full object-cover opacity-95" alt="Dashboard Preview" />

                {/* Floating Elements with Real Images */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 w-48 h-64 bg-white rounded-2xl shadow-2xl p-2 border border-primary/10"
                >
                  <img src="/menu_mobile_modern.png" className="w-full h-full object-cover rounded-xl" alt="Mobile Menu" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-2xl shadow-2xl p-2 border border-accent/20"
                >
                  <img src="/qr_code_table.png" className="w-full h-full object-cover rounded-xl" alt="QR Table" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// LOGOS CAROUSEL SECTION (INFINITE)
// ============================================

function LogosSection() {
  const logos = [
    "La Tapería", "El Rincón", "Casa María", "Bar Central",
    "Pizzería Roma", "Café Sol", "Taberna Luna", "Gastro Lab",
    "La Tapería", "El Rincón", "Casa María", "Bar Central"
  ];

  return (
    <section className="py-20 border-y border-border bg-white overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Restaurantes que confían en nosotros
        </p>
      </div>

      <motion.div
        className="flex gap-20 items-center whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <span
            key={i}
            className="text-2xl md:text-3xl font-bold text-slate-200 lowercase tracking-tighter hover:text-primary transition-colors cursor-default"
          >
            {logo}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================

function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "Menú con código QR",
      description: "Genera códigos QR únicos para cada mesa. Tus clientes escanean y acceden al menú en segundos.",
      color: "from-primary to-emerald-600",
    },
    {
      icon: Smartphone,
      title: "Pedidos online",
      description: "Recibe pedidos directamente desde el móvil de tus clientes. Delivery, takeaway o en mesa.",
      color: "from-primary/80 to-accent/80",
    },
    {
      icon: CreditCard,
      title: "Pagos integrados",
      description: "Acepta pagos con tarjeta de forma segura con Stripe. El dinero llega directo a tu cuenta.",
      color: "from-accent to-yellow-500",
    },
    {
      icon: Bell,
      title: "Notificaciones en tiempo real",
      description: "Recibe alertas instantáneas cuando lleguen nuevos pedidos. Nunca pierdas una venta.",
      color: "from-primary to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Analytics avanzados",
      description: "Entiende qué productos venden más, horarios pico y comportamiento de tus clientes.",
      color: "from-accent/60 to-primary/60",
    },
    {
      icon: Palette,
      title: "100% personalizable",
      description: "Adapta colores, fuentes y estilo a la imagen de tu restaurante. Tu marca, tu estilo.",
      color: "from-primary to-accent",
    },
    {
      icon: Languages,
      title: "Multi-idioma",
      description: "Tu menú en español, inglés, francés, alemán y más. Perfecto para zonas turísticas.",
      color: "from-emerald-400 to-primary",
    },
    {
      icon: Zap,
      title: "Ultra rápido",
      description: "Tu menú carga en menos de 1 segundo. Optimizado para cualquier dispositivo móvil.",
      color: "from-accent to-yellow-600",
    },
    {
      icon: Shield,
      title: "Seguro y fiable",
      description: "Datos protegidos, pagos seguros con Stripe, hosting en Europa. Cumplimos con RGPD.",
      color: "from-primary to-emerald-700",
    },
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <FadeUp>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
              Funcionalidades Expertas
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              Ingeniería para tu <br />
              <span className="gradient-text">restaurante.</span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={i * 0.05}>
              <div className="group relative p-8 rounded-3xl bg-white border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// IMAGE SHOWCASE
// ============================================

function ImageShowcase() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <h2 className="text-5xl lg:text-7xl font-semibold tracking-tighter mb-8 leading-tight">
              Una interfaz que <br />
              <span className="text-primary italic">atrapa.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Hemos diseñado cada pixel para que el cliente no solo vea tu carta, sino que la experimente. El menú digital más rápido y visual de España.
            </p>
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Check size={14} />
                </div>
                <span className="font-medium">Carga en menos de 1s</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Check size={14} />
                </div>
                <span className="font-medium">Optimizado para playa y GPS</span>
              </div>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 gap-4">
            <ScaleIn className="space-y-4 pt-20">
              <img src="/menu_mobile_modern.png" className="rounded-3xl shadow-2xl border border-black/5" />
              <img src="/qr_code_table.png" className="rounded-3xl shadow-2xl border border-black/5" />
            </ScaleIn>
            <ScaleIn delay={0.2}>
              <img src="/dashboard_preview.png" className="rounded-3xl shadow-2xl border border-black/5" />
              <div className="mt-4 p-8 bg-primary rounded-3xl text-white">
                <p className="text-3xl font-bold">42%</p>
                <p className="text-xs uppercase tracking-widest opacity-60">Incremento de pedidos</p>
              </div>
            </ScaleIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS SECTION (REDISEÑADO CORPORATIVO)
// ============================================

function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Regístrate gratis", description: "Crea tu cuenta en 30 segundos. Sin tarjeta de crédito.", icon: Users },
    { number: "02", title: "Sube tu menú", description: "Importación masiva con IA experta en gastronomía.", icon: Sparkles },
    { number: "03", title: "Comparte tu QR", description: "Imprime tus códigos para mesa, hamaca o terraza.", icon: QrCode },
    { number: "04", title: "Recibe pedidos", description: "Control total desde un dashboard centralizado.", icon: TrendingUp },
  ];

  return (
    <section className="py-40 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-24">
          <FadeUp>
            <h2 className="text-6xl lg:text-8xl font-semibold tracking-tighter leading-none mb-6">Digitalización <br /><span className="text-primary italic">en minutos.</span></h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">No pierdas más tiempo. Nuestra tecnología está diseñada para que tú te centres en el servicio.</p>
          </FadeUp>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.1}>
              <div className="group relative">
                <div className="aspect-square rounded-[3rem] bg-slate-50 border border-slate-100 p-10 flex flex-col justify-between hover:bg-primary transition-all duration-500 overflow-hidden relative">
                  <div className="text-[10rem] font-bold text-slate-100/50 absolute -top-10 -right-5 group-hover:text-white/10 transition-colors">{step.number}</div>
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform relative z-10">
                    <step.icon size={32} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">{step.title}</h3>
                    <p className="text-muted-foreground group-hover:text-white/70 transition-colors leading-snug">{step.description}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION (REDISEÑADO EXPERTO)
// ============================================

function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      highlight: false,
      features: ["Menú digital ilimitado", "Códigos QR básicos", "Pedidos online", "Pagos tarjeta"],
      cta: "Seleccionar Plan",
      description: "Ideal para cafeterías y bares pequeños."
    },
    {
      name: "Básico",
      price: "40",
      highlight: true,
      badge: "MÁS POPULAR",
      features: ["Todo del Starter", "0% Comisiones MyDigitable", "Multi-idioma Pro", "Analytics básicos", "Soporte vía Chat"],
      cta: "Seleccionar Plan",
      description: "Perfecto para restaurantes en crecimiento."
    },
    {
      name: "Pro",
      price: "90",
      highlight: false,
      features: ["Todo del Básico", "Beach GPS Master", "IA Sync Avanzada", "Soporte Prioritario 24/7", "API de Integración"],
      cta: "Seleccionar Plan",
      description: "Para negocios con múltiples sedes y playa."
    },
  ];

  return (
    <section id="pricing" className="py-40 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo sutiles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <FadeUp>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Inversión Inteligente</span>
            <h2 className="text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-none">Precios Claros<span className="text-primary">.</span></h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">Sin letras pequeñas. Elige el plan que mejor se adapte a tu escala actual.</p>
          </FadeUp>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <ScaleIn key={p.name} delay={i * 0.1}>
              <div className={`relative p-10 rounded-[3rem] flex flex-col h-full transition-all duration-500 border ${p.highlight
                  ? 'bg-white border-primary shadow-[0_32px_64px_-16px_rgba(34,197,94,0.15)] ring-1 ring-primary/20'
                  : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-xl'
                }`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[9px] font-black tracking-widest">
                    {p.badge}
                  </div>
                )}

                <div className="mb-8 text-center lg:text-left">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{p.name}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8 justify-center lg:justify-start">
                  <span className="text-7xl font-bold tracking-tighter">€{p.price}</span>
                  <span className="text-slate-400 text-sm font-medium">/mes</span>
                </div>

                <div className="flex-1 mb-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-6">¿Qué incluye?</p>
                  <ul className="space-y-4">
                    {p.features.map(f => (
                      <li key={f} className="flex gap-3 items-center text-slate-600">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p.highlight ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium tracking-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/register"
                  className={`w-full h-16 rounded-2xl flex items-center justify-center font-bold text-sm uppercase tracking-widest transition-all ${p.highlight
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary/90'
                      : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-primary hover:text-primary'
                    }`}
                >
                  {p.cta}
                </Link>
              </div>
            </ScaleIn>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <p className="text-center mt-12 text-slate-400 text-xs font-medium">
            * Todos los planes incluyen 7 días de prueba gratuita. Sin compromiso de permanencia.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ============================================
// TESTIMONIALS SECTION
// ============================================

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-40 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="absolute -inset-10 bg-primary/5 blur-[100px]" />
          <img src="/menu_mobile_modern.png" className="relative w-2/3 mx-auto rounded-[3rem] shadow-2xl border border-slate-100" />
        </div>
        <div className="space-y-12">
          <Star className="text-accent w-12 h-12 fill-accent" />
          <p className="text-4xl lg:text-5xl font-light italic leading-snug tracking-tight text-foreground">
            "Este sistema ha cambiado las reglas del juego. El <span className="font-bold text-primary">Modo Playa GPS</span> nos salvó el verano."
          </p>
          <div className="pt-8 border-t border-slate-100">
            <p className="text-2xl font-bold">Carlos Rivera</p>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-300">CEO, Beach Bistro Club</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION (REDISEÑO IMPACTO)
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    { q: "¿Cómo funciona el GPS en playa?", a: "El cliente escanea el QR de su hamaca. Al pedir, el sistema asocia automáticamente la posición exacta para que tu equipo llegue sin errores." },
    { q: "¿Es compatible con mi TPV?", a: "MyDigitable funciona de forma autónoma pero permite integraciones vía API con los TPV más populares del mercado español." },
    { q: "¿Hay permanencia mínima?", a: "Ninguna. Creemos tanto en nuestro producto que puedes cancelar en cualquier momento desde tu panel de administrador." },
  ];

  return (
    <section id="faq" className="py-40 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-24">
          <FadeUp>
            <h2 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">FAQ<span className="text-primary">.</span></h2>
            <p className="text-xl text-muted-foreground">Despeja tus dudas y empieza a vender más.</p>
          </FadeUp>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div
                className={`p-10 rounded-3xl border transition-all cursor-pointer ${openIndex === i ? 'bg-white border-primary shadow-xl scale-[1.02]' : 'bg-white/50 border-slate-200 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                onClick={() => setOpenIndex(i)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold tracking-tight">{faq.q}</h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 ${openIndex === i ? 'bg-primary text-white rotate-45' : 'bg-slate-100 text-slate-400'}`}>
                    <Plus size={20} />
                  </div>
                </div>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-lg text-muted-foreground font-light leading-relaxed pt-4 border-t border-slate-100">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// FINAL CTA
// ============================================

function FinalCTA() {
  return (
    <section className="py-40 bg-primary/10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-12">
        <h2 className="text-7xl lg:text-9xl font-semibold tracking-tighter leading-none">Únete a la <br /> revolución.</h2>
        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">Más de 500 restaurantes no pueden estar equivocados. Digitaliza hoy.</p>
        <div className="pt-10">
          <Link href="/register" className="h-24 px-20 bg-primary text-white rounded-full text-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 transition-transform flex items-center justify-center inline-flex">
            Empezar GRATIS
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-24 border-t border-border bg-white text-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="font-semibold text-2xl tracking-tighter">MyDigitable</span>
        </Link>
        <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">
          <span>INSTAGRAM</span>
          <span>LINKEDIN</span>
          <span>LEGAL</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <ImageShowcase />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </>
  );
}

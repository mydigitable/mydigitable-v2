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
  ChevronDown,
  ChefHat,
} from "lucide-react";

// ============================================
// DICCIONARIO DE TRADUCCIONES MASTER (7 IDIOMAS)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<string, any> = {
  ES: {
    nav: ["Funciones", "Precios", "Testimonios", "FAQ"],
    login: "Iniciar sesión",
    cta: "Empezar gratis",
    hero: {
      badge: "✨ Únete a 500+ restaurantes que ya venden más",
      title1: "Digitaliza tu restaurante",
      title2: "y aumenta tus ventas",
      titleGradient: "hasta un 42%",
      subtitle: "Menú QR, pedidos online y pagos integrados.",
      subtitleAccent: "Todo en 5 minutos. Sin complicaciones.",
      demo: "Ver demo en vivo",
      typeAnimation: [
        "Digitaliza tu restaurante en 5 minutos",
        2000,
        "Aumenta tus ventas hasta un 42%",
        2000,
        "El menú digital que tus clientes adoran",
        2000,
      ],
    },
    logos: "Restaurantes que confían en nosotros",
    features: {
      badge: "Todo lo que necesitas",
      title: "Tecnología diseñada",
      titleAccent: "para vender más.",
      items: [
        { t: "Menú QR Inteligente", d: "Códigos únicos por mesa. Tus clientes escanean y piden al instante." },
        { t: "Pedidos en Tiempo Real", d: "Recibe comandas directas en tu dashboard. Sin intermediarios." },
        { t: "Pagos Seguros Stripe", d: "Cobra al instante. El dinero va directo a tu cuenta bancaria." },
        { t: "Notificaciones Instantáneas", d: "Alertas en tiempo real de cada nuevo pedido. Nunca pierdas una venta." },
        { t: "Analytics Profesional", d: "Descubre qué platos venden más, cuándo y por qué. Datos que importan." },
        { t: "100% Personalizable", d: "Colores, logo, fotos. Tu marca, tu estilo. Sin límites creativos." }
      ]
    },
    showcase: {
      title: "Una interfaz que",
      titleAccent: "atrapa.",
      desc: "Hemos diseñado cada pixel para que el cliente no solo vea tu carta, sino que la experimente. El menú digital más rápido y visual de España.",
      point1: "Carga en menos de 1s",
      point2: "Optimizado para playa y GPS",
      increment: "Incremento de pedidos",
    },
    howItWorks: {
      title: "Digitalización",
      titleAccent: "en minutos.",
      desc: "No pierdas más tiempo. Nuestra tecnología está diseñada para que tú te centres en el servicio.",
      steps: [
        { title: "Regístrate gratis", desc: "Crea tu cuenta en 30 segundos. Sin tarjeta." },
        { title: "Sube tu menú", desc: "Importación masiva con IA experta gastronómica." },
        { title: "Comparte tu QR", desc: "Imprime tus códigos para mesa o terraza." },
        { title: "Recibe pedidos", desc: "Control total desde un dashboard centralizado." },
      ]
    },
    pricing: {
      badge: "Inversión Inteligente",
      title: "Precios Claros",
      subtitle: "Sin permanencia. Cobra desde el día 1 con devolución disponible.",
      select: "Seleccionar Plan",
      footer: "* Descuentos por volumen: 2-5 locales -5%, 6+ locales -10%",
      plans: [
        { name: "BÁSICO", price: "49", desc: "Perfecto para empezar - Todo lo esencial para digitalizar tu negocio", feat: ["Menú QR ilimitado", "Pedidos + Pagos", "3 idiomas", "3 staff", "Stats básicos"] },
        { name: "PRO", price: "99", desc: "Para restaurantes serios - Multiplica tus ventas con IA y mesas compartidas", feat: ["Todo del BÁSICO", "🔥 Mesa compartida con PIN", "📸 IA importar menú", "KDS cocina", "App camareros", "10 staff", "7 idiomas", "💰 +42% más pedidos de media"], popular: true },
        { name: "PREMIUM", price: "150", desc: "Domina tu mercado - Solución enterprise para beach clubs y cadenas hoteleras", feat: ["Todo del PRO", "🏖️ Modo playa GPS", "🏨 Modo hotel", "White label", "API completa", "Staff ilimitado"] }
      ]
    },
    testimonials: {
      quote: "Este sistema ha cambiado las reglas del juego. El Modo Playa GPS nos salvó el verano.",
      author: "Carlos Rivera",
      role: "CEO, Beach Bistro Club"
    },
    faq: {
      title: "FAQ",
      desc: "Despeja tus dudas y empieza a vender más.",
      questions: [
        { q: "¿Cómo funciona la mesa compartida?", a: "Un cliente escanea el QR y genera un PIN de 6 dígitos. Los demás se unen con ese PIN. Cada uno ve los pedidos del grupo en tiempo real y puede pagar solo lo suyo." },
        { q: "¿Qué es el KDS?", a: "Kitchen Display System. Una pantalla para cocina que muestra pedidos en columnas (Pendientes/En proceso/Listos) con timers y alertas automáticas." },
        { q: "¿Hay permanencia mínima?", a: "Ninguna. Puedes cancelar cuando quieras y te devolvemos el dinero si lo solicitas." },
      ]
    },
    finalCta: {
      title: "Únete a los 500+ restaurantes que ya están vendiendo más.",
      desc: "Prueba gratis 7 días. Sin tarjeta de crédito. Cancela cuando quieras.",
      btn: "Empezar gratis ahora →"
    }
  },
  EN: {
    nav: ["Features", "Pricing", "Testimonials", "FAQ"],
    login: "Log in",
    cta: "Get started",
    hero: {
      badge: "+500 restaurants already trust us",
      title1: "The digital menu",
      title2: "your restaurant",
      titleGradient: "deserves",
      subtitle: "Digitalize your restaurant in minutes with our expert platform.",
      subtitleAccent: "No complications, just results.",
      demo: "View demo",
    },
    logos: "Restaurants that trust us",
    features: {
      badge: "Expert Features",
      title: "Engineering for your",
      titleAccent: "restaurant.",
      items: [
        { t: "QR Menu", d: "Generate unique codes for each table in seconds." },
        { t: "Online Orders", d: "Receive orders directly from customer mobiles." },
        { t: "Integrated Payments", d: "Secure Stripe payments direct to your account." },
        { t: "Real-time Alerts", d: "Instant notifications for new orders." },
        { t: "Pro Analytics", d: "Understand what sells and why." },
        { t: "Customizable", d: "Adapt the design to your brand identity." }
      ]
    },
    showcase: {
      title: "An interface that",
      titleAccent: "captivates.",
      desc: "We designed every pixel so customers don't just see your menu, they experience it. The fastest visual menu.",
      point1: "Loads in < 1s",
      point2: "Beach & GPS optimized",
      increment: "Order increase",
    },
    howItWorks: {
      title: "Digitalization",
      titleAccent: "in minutes.",
      desc: "Don't waste time. Our tech is designed so you can focus on service.",
      steps: [
        { title: "Free sign up", desc: "Create your account in 30s. No credit card." },
        { title: "Upload menu", desc: "Bulk import with Expert Gastronomic AI." },
        { title: "Share QR", desc: "Print your codes for tables or terrace." },
        { title: "Receive orders", desc: "Full control from a centralized dashboard." },
      ]
    },
    pricing: {
      badge: "Smart Investment",
      title: "Clear Pricing",
      subtitle: "No fine print. Choose the plan that fits your current scale.",
      select: "Select Plan",
      footer: "* All plans include 7-day free trial. No strings attached.",
      plans: [
        { name: "Starter", price: "0", desc: "Ideal for small cafes and bars.", feat: ["Digital menu", "Basic QR", "Online orders", "50 products"] },
        { name: "Growth", price: "39", desc: "Perfect for growing restaurants.", feat: ["Everything in Starter", "Unlimited products", "Multi-language", "Analytics", "Email support"] },
        { name: "Scale", price: "89", desc: "For beach clubs & multi-location.", feat: ["Everything in Growth", "Beach GPS", "Multi-location", "API", "24/7 Support"] }
      ]
    },
    testimonials: {
      quote: "This system changed the game. The Beach GPS Mode saved our summer season.",
      author: "Carlos Rivera",
      role: "CEO, Beach Bistro Club"
    },
    faq: {
      title: "FAQ",
      desc: "Clear your doubts and start selling more.",
      questions: [
        { q: "How does beach GPS work?", a: "Customer scans the QR. When ordering, system links legal position automatically." },
        { q: "POS compatible?", a: "MyDigitable is autonomous but allows API integrations with top POS systems." },
        { q: "Minimum stay?", a: "None. We believe in our product, cancel anytime." },
      ]
    },
    finalCta: {
      title: "Join the revolution.",
      desc: "Over 500 restaurants can't be wrong. Digitalize today.",
      btn: "Get started FREE"
    }
  },
  PT: {
    nav: ["Funções", "Preços", "Depoimentos", "FAQ"],
    login: "Entrar",
    cta: "Começar grátis",
    hero: { badge: "+500 restaurantes já confiam em nós", title1: "O menu digital", title2: "que o seu restaurante", titleGradient: "merece", subtitle: "Digitalize seu restaurante em minutos.", subtitleAccent: "Sem complicações.", demo: "Ver demo" },
    logos: "Restaurantes que confiam",
    features: { badge: "Funções Especialistas", title: "Engenharia para o seu", titleAccent: "restaurante.", items: [{ t: "Menu QR", d: "Gere códigos exclusivos." }, { t: "Pedidos", d: "Receba comandas diretas." }, { t: "Pagamentos", d: "Cobranças com Stripe." }, { t: "Alertas", d: "Notificações instantâneas." }, { t: "Análise", d: "Entenda suas vendas." }, { t: "Marca", d: "Totalmente adaptável." }] },
    showcase: { title: "Uma interface que", titleAccent: "atrai.", desc: "Cada pixel desenhado para a experiência do cliente.", point1: "Carga em <1s", point2: "GPS para praia", increment: "Aumento de pedidos" },
    howItWorks: { title: "Digitalização", titleAccent: "em minutos.", desc: "Foque no serviço com nossa tecnologia.", steps: [{ title: "Registo grátis", desc: "Conta em 30 segundos." }, { title: "Suba o menu", desc: "IA gastronómica." }, { title: "Partilhe o QR", desc: "Imprima para mesas." }, { title: "Receba pedidos", desc: "Controle total." }] },
    pricing: { badge: "Investimento Inteligente", title: "Preços Claros", subtitle: "Escolha o melhor plano.", select: "Selecionar Plano", footer: "* 7 dias grátis. Sem fidelidade.", plans: [{ name: "Starter", price: "0", desc: "Ideal para bares pequenos.", feat: ["Menu digital", "QR básicos", "Pedidos", "50 produtos"] }, { name: "Growth", price: "39", desc: "Para restaurantes.", feat: ["Starter +", "Produtos ilimitados", "Multi-idioma", "Analytics", "Suporte"] }, { name: "Scale", price: "89", desc: "Para beach clubs.", feat: ["Growth +", "GPS Praia", "Multi-local", "API", "24/7"] }] },
    testimonials: { quote: "Este sistema mudou as regras. O Modo Praia GPS salvou o verão.", author: "Carlos Rivera", role: "CEO, Beach Bistro Club" },
    faq: { title: "FAQ", desc: "Tire as suas dúvidas.", questions: [{ q: "Como funciona o GPS?", a: "O sistema associa a posição automaticamente." }, { q: "Compatível com TPV?", a: "Sim, via API." }, { q: "Fidelidade?", a: "Nenhuma." }] },
    finalCta: { title: "Participe da revolução.", desc: "Digitalize hoje.", btn: "Começar GRÁTIS" }
  },
  IT: {
    nav: ["Funzioni", "Prezzi", "Recensioni", "FAQ"],
    login: "Accedi",
    cta: "Inizia gratis",
    hero: { badge: "+500 ristoranti si fidano di noi", title1: "Il menu digitale", title2: "che il tuo ristorante", titleGradient: "merita", subtitle: "Digitalizza il tuo ristorante in pochi minuti.", subtitleAccent: "Senza complicazioni.", demo: "Vedi demo" },
    logos: "Ristoranti partner",
    features: { badge: "Funzioni Expert", title: "Ingegneria per il tuo", titleAccent: "ristorante.", items: [{ t: "Menu QR", d: "Codici unici in secondi." }, { t: "Ordini", d: "Dal mobile del cliente." }, { t: "Pagamenti", d: "Stripe integrato." }, { t: "Allerta", d: "Notifiche istantanee." }, { t: "Analisi", d: "Capisci i tuoi vendite." }, { t: "Branding", d: "Design adattabile." }] },
    showcase: { title: "Un'interfaccia che", titleAccent: "cattura.", desc: "Supporto totale per l'esperienza del cliente.", point1: "Carica in <1s", point2: "GPS per spiagge", increment: "Incremento ordini" },
    howItWorks: { title: "Digitalizzazione", titleAccent: "in minuti.", desc: "Focus sul servizio con la tecnologia.", steps: [{ title: "Registrazione", desc: "Account in 30 secondi." }, { title: "Carica menu", desc: "IA esperta." }, { title: "Condividi QR", desc: "Stampa per tavoli." }, { title: "Ordini", desc: "Controllo totale." }] },
    pricing: { badge: "Investimento Smart", title: "Prezzi Chiari", subtitle: "Scegli il piano giusto.", select: "Seleziona Piano", footer: "* 7 giorni gratis. Nessun vincolo.", plans: [{ name: "Starter", price: "0", desc: "Piccoli caffè e bar.", feat: ["Menu digitale", "QR base", "Ordini", "50 prodotti"] }, { name: "Growth", price: "39", desc: "Ristoranti in crescita.", feat: ["Starter +", "Prodotti illimitati", "Multi-lingua", "Analisi", "Supporto"] }, { name: "Scale", price: "89", desc: "Stabilimenti balneari.", feat: ["Growth +", "GPS Spiaggia", "Multi-locale", "API", "24/7"] }] },
    testimonials: { quote: "Questo sistema ha cambiato tutto. Il GPS per spiagge ci ha salvato.", author: "Carlos Rivera", role: "CEO, Beach Bistro Club" },
    faq: { title: "FAQ", desc: "Domande e risposte.", questions: [{ q: "Come funziona il GPS?", a: "Associazione automatica della posizione." }, { q: "Compatibile TPV?", a: "Sì, tramite API." }, { q: "Vincoli?", a: "Nessuno." }] },
    finalCta: { title: "Unisciti alla rivoluzione.", desc: "Digitalizza ora.", btn: "Inizia GRATIS" }
  },
  FR: {
    nav: ["Fonctions", "Tarifs", "Avis", "FAQ"],
    login: "Connexion",
    cta: "Démarrer gratis",
    hero: { badge: "+500 restaurants nous font confiance", title1: "Le menu digital", title2: "que votre restaurant", titleGradient: "mérite", subtitle: "Digitalisez votre restaurant en minutes.", subtitleAccent: "Efficacité garantie.", demo: "Voir démo" },
    logos: "Restaurants partenaires",
    features: { badge: "Fonctions Experts", title: "Ingénierie pour votre", titleAccent: "restaurant.", items: [{ t: "Menu QR", d: "Codes uniques par table." }, { t: "Commandes", d: "Depuis le mobile client." }, { t: "Paiements", d: "Stripe sécurisé." }, { t: "Alertes", d: "Notifications en direct." }, { t: "Analyses", d: "Suivez vos ventes." }, { t: "Design", d: "Totalement flexible." }] },
    showcase: { title: "Une interface qui", titleAccent: "séduit.", desc: "Chaque pixel pour l'expérience client.", point1: "Charge en <1s", point2: "GPS plage optimisé", increment: "Hausse des commandes" },
    howItWorks: { title: "Numérisation", titleAccent: "en minutes.", desc: "Technologie pour le service client.", steps: [{ title: "Inscription", desc: "Compte en 30 secondes." }, { title: "Import menu", desc: "IA intelligente." }, { title: "Partage QR", desc: "Imprimez vos codes." }, { title: "Commandes", desc: "Contrôle total." }] },
    pricing: { badge: "Investissement Malin", title: "Tarifs Clairs", subtitle: "Choisissez votre plan.", select: "Choisir un Plan", footer: "* 7 jours gratuits. Sans engagement.", plans: [{ name: "Starter", price: "0", desc: "Petits cafés et bars.", feat: ["Menu digital", "QR base", "Commandes", "50 produits"] }, { name: "Growth", price: "39", desc: "Restaurants en croissance.", feat: ["Starter +", "Produits illimités", "Multi-langue", "Analyses", "Support"] }, { name: "Scale", price: "89", desc: "Beach clubs.", feat: ["Growth +", "GPS Plage", "Multi-local", "API", "24/7"] }] },
    testimonials: { quote: "Ce système a tout changé. Le Mode Plage GPS nous a sauvés.", author: "Carlos Rivera", role: "CEO, Beach Bistro Club" },
    faq: { title: "FAQ", desc: "Réponses à vos questions.", questions: [{ q: "GPS de plage ?", a: "Position liée à la commande." }, { q: "Compatible caisse ?", a: "Oui, via API." }, { q: "Engagement ?", a: "Aucun." }] },
    finalCta: { title: "Rejoignez la révolution.", desc: "Digitalisez aujourd'hui.", btn: "Démarrer GRATUIT" }
  },
  DE: {
    nav: ["Funktionen", "Preise", "Referenzen", "FAQ"],
    login: "Anmelden",
    cta: "Gratis starten",
    hero: { badge: "Über 500 Restaurants vertrauen uns", title1: "Die digitale Karte", title2: "die Ihr Restaurant", titleGradient: "verdient", subtitle: "Digitalisieren Sie Ihr Restaurant in Minuten.", subtitleAccent: "Einfach und effektiv.", demo: "Demo sehen" },
    logos: "Partner-Restaurants",
    features: { badge: "Experten-Funktionen", title: "Engineering für Ihr", titleAccent: "Restaurant.", items: [{ t: "QR-Menü", d: "Einzigartige Codes." }, { t: "Bestellungen", d: "Vom Handy des Kunden." }, { t: "Zahlungen", d: "Sicheres Stripe." }, { t: "Alarme", d: "Sofort-Benachrichtigung." }, { t: "Analyse", d: "Verstehen Sie Verkäufe." }, { t: "Branding", d: "Individueller Stil." }] },
    showcase: { title: "Ein Interface das", titleAccent: "begeistert.", desc: "Jedes Pixel für das Kundenerlebnis.", point1: "Lädt in <1s", point2: "GPS Strand-Modus", increment: "Mehr Bestellungen" },
    howItWorks: { title: "Digitalisierung", titleAccent: "in Minuten.", desc: "Fokus auf Service dank Technik.", steps: [{ title: "Anmeldung", desc: "Konto in 30 Sekunden." }, { title: "Menü-Upload", desc: "Effiziente KI." }, { title: "QR-Code", desc: "Druck für Tische." }, { title: "Bestellungen", desc: "Zentrale Kontrolle." }] },
    pricing: { badge: "Smart Investment", title: "Klare Preise", subtitle: "Wählen Sie Ihren Plan.", select: "Preis wählen", footer: "* 7 Tage gratis. Keine Bindung.", plans: [{ name: "Starter", price: "0", desc: "Kleine Cafés & Bars.", feat: ["Digitales Menü", "QR Basis", "Bestellungen", "50 Produkte"] }, { name: "Growth", price: "39", desc: "Wachsende Restaurants.", feat: ["Starter +", "Unbegrenzte Produkte", "Multi-Sprache", "Analysen", "Support"] }, { name: "Scale", price: "89", desc: "Strandbetriebe.", feat: ["Growth +", "Strand GPS", "Multi-Standort", "API", "24/7"] }] },
    testimonials: { quote: "Dieses System hat alles geändert. Der Strand-GPS-Modus war perfekt.", author: "Carlos Rivera", role: "CEO, Beach Bistro Club" },
    faq: { title: "FAQ", desc: "Fragen und Antworten.", questions: [{ q: "Strand-GPS ?", a: "Position wird automatisch verknüpft." }, { q: "KASSEN-System ?", a: "Ja, via API." }, { q: "Bindung ?", a: "Keine." }] },
    finalCta: { title: "Revolution starten.", desc: "Heute digitalisieren.", btn: "Gratis STARTEN" }
  },
  EL: {
    nav: ["Λειτουργίες", "Τιμές", "Κριτικές", "FAQ"],
    login: "Είσοδος",
    cta: "Δωρεάν έναρξη",
    hero: { badge: "500+ εστιατόρια μας εμπιστεύονται", title1: "Ο ψηφιακός κατάλογος", title2: "που το εστιατόριό σας", titleGradient: "αξίζει", subtitle: "Ψηφιοποιήστε το εστιατόριό σας σε λεπτά.", subtitleAccent: "Αποτελέσματα άμεσα.", demo: "Δείτε το demo" },
    logos: "Εστιατόρια συνεργάτες",
    features: { badge: "Expert Λειτουργίες", title: "Τεχνολογία για το", titleAccent: "εστιατόριό σας.", items: [{ t: "QR Μενού", d: "Κωδικοί ανά τραπέζι." }, { t: "Παραγγελίες", d: "Από το κινητό πελάτη." }, { t: "Πληρωμές", d: "Ασφαλείς μέσω Stripe." }, { t: "Ειδοποίηση", d: "Άμεσα νέα από πελάτες." }, { t: "Analytics", d: "Δείτε τις πωλήσεις." }, { t: "Design", d: "Προσαρμόσιμο σχέδιο." }] },
    showcase: { title: "Ένα περιβάλλον που", titleAccent: "μαγνητίζει.", desc: "Σχεδιασμένο για την εμπειρία πελάτη.", point1: "Φόρτωση σε <1s", point2: "GPS για παραλίες", increment: "Αύξηση παραγγελιών" },
    howItWorks: { title: "Ψηφιοποίηση", titleAccent: "σε λεπτά.", desc: "Εστίαση στην εξυπηρέτηση.", steps: [{ title: "Εγγραφή", desc: "Λογαριασμός σε 30s." }, { title: "Μενού", desc: "Εισαγωγή με AI." }, { title: "QR Code", desc: "Εκτύπωση κωδικών." }, { title: "Παραγγελίες", desc: "Κεντρικός έλεγχος." }] },
    pricing: { badge: "Έξυπνη Επένδυση", title: "Ξεκάθαρες Τιμές", subtitle: "Επιλέξτε το πλάνο σας.", select: "Επιλογή", footer: "* 7 ημέρες δωρεάν. Καμία δέσμευση.", plans: [{ name: "Starter", price: "0", desc: "Μικρά καφέ και μπαρ.", feat: ["Ψηφιακό μενού", "QR βάσης", "Παραγγελίες", "50 προϊόντα"] }, { name: "Growth", price: "39", desc: "Αναπτυσσόμενα εστιατόρια.", feat: ["Starter +", "Άπειρα προϊόντα", "Πολυγλωσσικό", "Analytics", "Support"] }, { name: "Scale", price: "89", desc: "Για beach clubs.", feat: ["Growth +", "GPS Παραλίας", "Multi-τοποθεσία", "API", "24/7"] }] },
    testimonials: { quote: "Αυτό το σύστημα άλλαξε τα πάντα. Το GPS παραλίας μας έσωσε.", author: "Carlos Rivera", role: "CEO, Beach Bistro Club" },
    faq: { title: "FAQ", desc: "Οι απαντήσεις σας.", questions: [{ q: "GPS παραλίας ;", a: "Αυτόματη σύνδεση θέσης." }, { q: "Σύνδεση με POS ;", a: "Ναι, μέσω API." }, { q: "Δέσμευση ;", a: "Καμία." }] },
    finalCta: { title: "Γίνετε μέρος της επανάστασης.", desc: "Ψηφιοποιήστε σήμερα.", btn: "Δωρεάν ΕΝΑΡΞΗ" }
  }
};

// ============================================
// ANIMATION HELPERS
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
// LANGUAGE SELECTOR
// ============================================

const languages = [
  { code: 'ES', flag: '🇪🇸' },
  { code: 'EN', flag: '🇬🇧' },
  { code: 'PT', flag: '🇵🇹' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'EL', flag: '🇬🇷' },
];

function LanguageSelector({ current, onSelect }: { current: { code: string; flag: string }, onSelect: (lang: { code: string; flag: string }) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors text-[13px] font-bold border border-transparent hover:border-border text-foreground"
      >
        <span>{current.flag}</span>
        <span className="text-muted-foreground">{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-border min-w-[140px] z-50 overflow-hidden text-foreground"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${current.code === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
              >
                <span>{lang.flag}</span>
                <span className="font-bold">{lang.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// NAVBAR
// ============================================

function Navbar({ lang, onSelectLang }: { lang: { code: string; flag: string }, onSelectLang: (l: { code: string; flag: string }) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const content = translations[lang.code] || translations.ES;

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"><span className="text-white font-bold text-xl italic">M</span></div>
              <span className="font-semibold text-xl text-foreground">MyDigitable</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {content.nav.map((n: string, i: number) => (
                <a key={i} href={`#${["features", "pricing", "testimonials", "faq"][i]}`} className="text-muted-foreground hover:text-foreground transition-colors text-[14px] font-bold">{n}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <LanguageSelector current={lang} onSelect={onSelectLang} />
              <div className="w-px h-6 bg-border mx-2" />
              <Link href="/login" className="text-[14px] font-bold text-muted-foreground hover:text-foreground">{content.login}</Link>
              <Link href={`/register?lang=${lang.code}`} className="px-6 py-2.5 rounded-full bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">{content.cta}</Link>
            </div>

            <div className="md:hidden flex items-center gap-4 text-foreground">
              <LanguageSelector current={lang} onSelect={onSelectLang} />
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl text-foreground"><Menu size={24} /></button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 text-foreground">
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-foreground"><X size={24} /></button>
              <div className="mt-16 space-y-6">
                {content.nav.map((n: string, i: number) => (
                  <a key={i} href={`#${["features", "pricing", "testimonials", "faq"][i]}`} className="block text-2xl font-bold" onClick={() => setMobileMenuOpen(false)}>{n}</a>
                ))}
                <hr className="my-6 border-slate-100" />
                <Link href="/login" className="block text-xl font-bold text-muted-foreground">{content.login}</Link>
                <Link href={`/register?lang=${lang.code}`} className="block w-full py-4 bg-primary text-white text-center rounded-2xl font-bold uppercase text-sm">{content.cta}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// HERO SECTION - ULTRA PREMIUM 3D DESIGN
// ============================================

function HeroSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.hero || translations.ES.hero;
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section ref={containerRef} className="relative min-h-[120vh] flex items-center justify-center overflow-hidden">
      {/* MODERN 2026 BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-yellow-50/30">
        {/* Vibrant animated gradient orbs - Green & Yellow */}
        <motion.div
          className="absolute -top-40 -left-40 w-[900px] h-[900px] bg-gradient-to-br from-emerald-400/40 via-green-500/30 to-emerald-600/20 rounded-full blur-[140px]"
          animate={{
            x: [0, 120, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[800px] h-[800px] bg-gradient-to-tl from-yellow-400/50 via-amber-500/40 to-yellow-300/30 rounded-full blur-[130px]"
          animate={{
            x: [0, -100, 0],
            y: [0, -70, 0],
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-lime-400/30 to-emerald-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.7, 0.4],
            rotate: [0, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating particles with green/yellow theme */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-emerald-400/40' : 'bg-yellow-400/40'}`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.8, 1]
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Modern mesh gradient overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            radial-gradient(at 20% 30%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(251, 191, 36, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(34, 197, 94, 0.1) 0px, transparent 50%)
          `
        }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <motion.div style={{ y, opacity, scale }} className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT SIDE - TEXT CONTENT */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <FadeUp>
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-xl text-primary text-sm font-bold mb-8 border border-primary/20 shadow-lg shadow-primary/5"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    "0 10px 15px -3px rgba(34, 197, 94, 0.05)",
                    "0 10px 25px -3px rgba(34, 197, 94, 0.15)",
                    "0 10px 15px -3px rgba(34, 197, 94, 0.05)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles size={16} />
                </motion.div>
                {content.badge}
              </motion.div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-foreground mb-8 leading-[0.95]">
                <span className="block">{content.title1}</span>
                <span className="block mt-2">{content.title2}</span>
                <span className="block mt-2 relative">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-500 via-green-400 to-yellow-500 bg-clip-text text-transparent animate-gradient-shift italic">
                    {content.titleGradient}
                  </span>
                  <motion.span
                    className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 blur-2xl rounded-full -z-10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
                {content.subtitle} <span className="text-primary font-semibold">{content.subtitleAccent}</span>
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link
                  href={`/register?lang=${lang.code}`}
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white text-lg font-bold shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 transition-all overflow-hidden"
                >
                  <span className="relative z-10">{translations[lang.code]?.cta || translations.ES.cta}</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-lime-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
                <a
                  href="#demo"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/90 backdrop-blur-xl text-foreground text-lg font-bold border-2 border-emerald-200 hover:border-emerald-400 hover:bg-white transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play size={20} fill="currentColor" className="text-emerald-600" />
                  </motion.div>
                  {content.demo}
                </a>
              </div>
            </FadeUp>

            {/* Stats Row */}
            <FadeUp delay={0.4}>
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
                {[
                  { value: "500+", label: "Restaurantes" },
                  { value: "2M+", label: "Pedidos/mes" },
                  { value: "4.9★", label: "Valoración" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <p className="text-3xl font-black text-foreground">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* RIGHT SIDE - 3D DEVICE SHOWCASE */}
          <div className="relative order-1 lg:order-2" id="demo">
            {/* Main glow effect */}
            <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-3xl opacity-60 rounded-full" />

            {/* 3D Device Stack */}
            <div className="relative perspective-1000">
              {/* Background laptop/dashboard - larger, behind */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 100, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 5 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <motion.img
                  src="/images/hero-demo.png"
                  alt="Dashboard MyDigitable"
                  className="w-full h-auto rounded-3xl shadow-2xl shadow-black/20 border border-white/50"
                  animate={{ y: [0, -15, 0], rotateY: [0, 2, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Floating phone - menu view */}
              <motion.div
                className="absolute -bottom-10 -left-10 lg:-left-20 w-48 lg:w-64 z-20"
                initial={{ opacity: 0, x: -50, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.img
                  src="/images/showcase-screens.png"
                  alt="Menú móvil"
                  className="w-full h-auto rounded-2xl shadow-2xl shadow-black/30 border-4 border-white"
                  animate={{ y: [0, -20, 0], rotate: [-6, -4, -6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Floating glassmorphism cards */}
              <motion.div
                className="absolute -right-4 lg:-right-10 top-10 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-emerald-100 z-30"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <TrendingUp className="text-white" size={22} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">+42%</p>
                      <p className="text-[10px] font-bold uppercase text-emerald-600/70 tracking-wider">Más ventas</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Notification card */}
              <motion.div
                className="absolute -left-6 lg:-left-16 top-1/3 bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-yellow-100 z-30"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Bell className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Nuevo pedido!</p>
                      <p className="text-[10px] text-muted-foreground">Mesa 7 • €47.90</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Kitchen order card */}
              <motion.div
                className="absolute -right-8 lg:-right-14 bottom-1/4 bg-emerald-900/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-emerald-700/50 z-30"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-500/30">
                      <ChefHat className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Cocina</p>
                      <p className="text-[10px] text-lime-400 font-bold">3 pedidos listos</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* QR Code floating */}
              <motion.div
                className="absolute right-1/4 -bottom-6 bg-white rounded-xl p-2 shadow-xl border border-emerald-100 z-20"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-yellow-50 rounded-lg flex items-center justify-center"
                >
                  <QrCode className="text-emerald-600" size={32} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scroll</p>
        <ChevronDown size={20} className="text-primary" />
      </motion.div>
    </section>
  );
}

function LogosSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.logos || translations.ES.logos;
  const logos = ["La Tapería", "El Rincón", "Casa María", "Bar Central", "Pizzería Roma", "Café Sol", "Taberna Luna", "Gastro Lab"];
  return (
    <section className="py-20 border-y border-border bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center uppercase tracking-[0.4em] text-slate-300 text-[10px] font-black">{content}</div>
      <motion.div className="flex gap-20 items-center whitespace-nowrap" animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}>
        {[...logos, ...logos].map((l, i) => (
          <span key={i} className="text-2xl font-bold text-slate-200 hover:text-primary transition-colors cursor-default">{l}</span>
        ))}
      </motion.div>
    </section>
  );
}

function FeaturesSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.features || translations.ES.features;
  const icons = [QrCode, Smartphone, CreditCard, Bell, BarChart3, Palette];
  const colors = ["from-primary to-emerald-600", "from-primary/80 to-accent/80", "from-accent to-yellow-500", "from-primary to-emerald-500", "from-accent/60 to-primary/60", "from-primary to-accent"];

  return (
    <section id="features" className="py-32 bg-slate-50 relative overflow-hidden text-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <FadeUp><span className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full">{content.badge}</span></FadeUp>
        <FadeUp delay={0.1}><h2 className="text-4xl sm:text-6xl font-semibold mt-6">{content.title} <br /><span className="gradient-text italic">{content.titleAccent}</span></h2></FadeUp>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.items.map((item: Record<string, string>, i: number) => {
          const Icon = icons[i];
          return (
            <FadeUp key={i} delay={i * 0.05}>
              <motion.div
                className="p-8 rounded-3xl bg-white border border-border group hover:border-primary/20 transition-all duration-500 overflow-hidden relative cursor-pointer"
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px -12px rgba(34, 197, 94, 0.15)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[i]} flex items-center justify-center mb-6 text-white`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon size={28} />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{item.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.d}</p>

                {/* Gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                />
              </motion.div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}

function ShowcaseSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.showcase || translations.ES.showcase;
  return (
    <section className="py-32 bg-white overflow-hidden text-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-8 leading-tight">{content.title} <br /><span className="text-primary italic">{content.titleAccent}</span></h2>
            <p className="text-xl text-muted-foreground font-light leading-relaxed mb-10">{content.desc}</p>
            <div className="space-y-4">
              {[content.point1, content.point2].map(p => (
                <div key={p} className="flex items-center gap-4 font-bold text-foreground overflow-hidden"><Check size={20} className="text-primary" />{p}</div>
              ))}
            </div>
            {/* Stats cards */}
            <div className="flex gap-4 mt-10">
              <div className="p-6 bg-primary/10 rounded-2xl">
                <p className="text-3xl font-black text-primary">42%</p>
                <p className="text-[10px] uppercase text-muted-foreground mt-1 font-bold tracking-wider">{content.increment}</p>
              </div>
              <div className="p-6 bg-accent/10 rounded-2xl">
                <p className="text-3xl font-black text-accent">&lt;1s</p>
                <p className="text-[10px] uppercase text-muted-foreground mt-1 font-bold tracking-wider">{content.point1}</p>
              </div>
            </div>
          </FadeUp>

          {/* Nueva imagen de showcase - 3 teléfonos */}
          <ScaleIn>
            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl rounded-full" />
              <motion.img
                src="/images/showcase-screens.png"
                alt="MyDigitable - Menú, Pedidos y Cocina"
                className="relative w-full h-auto rounded-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </ScaleIn>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.howItWorks || translations.ES.howItWorks;
  const icons = [Users, Sparkles, QrCode, TrendingUp];
  return (
    <section className="py-40 bg-slate-50 relative overflow-hidden text-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center mb-24">
        <FadeUp><h2 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-none">{content.title} <br /><span className="text-primary italic">{content.titleAccent}</span></h2></FadeUp>
        <FadeUp delay={0.1}><p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">{content.desc}</p></FadeUp>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {content.steps.map((s: Record<string, string>, i: number) => {
          const Icon = icons[i];
          const num = i + 1;
          return (
            <FadeUp key={i} delay={i * 0.1}>
              <div className="group relative">
                <div className="aspect-square rounded-[3rem] bg-white border border-slate-100 p-10 flex flex-col justify-between hover:bg-primary transition-all duration-500 overflow-hidden relative">
                  <div className="text-[10rem] font-bold text-slate-50 absolute -top-10 -right-5 group-hover:text-white/10 transition-colors">0{num}</div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:scale-110 transition-all relative z-10"><Icon size={32} /></div>
                  <div className="relative z-10 text-foreground">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">{s.title}</h3>
                    <p className="text-muted-foreground group-hover:text-white/70 transition-colors leading-snug">{s.desc}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}

function PricingSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.pricing || translations.ES.pricing;
  return (
    <section id="pricing" className="py-40 bg-white relative overflow-hidden text-foreground">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <FadeUp>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">{content.badge}</span>
            <h2 className="text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-none">{content.title}<span className="text-primary text-foreground">.</span></h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">{content.subtitle}</p>
          </FadeUp>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 text-foreground">
          {content.plans.map((p: { name: string; price: string; desc: string; feat: string[]; popular?: boolean }, i: number) => (
            <ScaleIn key={i} delay={i * 0.1}>
              <div className={`relative p-10 rounded-[3rem] flex flex-col h-full transition-all duration-500 border overflow-hidden ${p.popular
                ? 'bg-white border-primary shadow-[0_32px_64px_-16px_rgba(34,197,94,0.15)] ring-1 ring-primary/20 scale-105'
                : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-xl'
                }`}>
                {p.popular && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase z-10">MÁS POPULAR</div>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    />
                  </>
                )}
                <div className="mb-8 text-center lg:text-left text-foreground relative z-10">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">{p.name}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{p.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8 justify-center lg:justify-start relative z-10">
                  <span className="text-7xl font-bold tracking-tighter italic">€{p.price}</span>
                  <span className="text-slate-400 text-sm font-medium">/mes</span>
                </div>
                <div className="flex-1 mb-10 text-foreground relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-6 text-slate-300">INCLUYE:</p>
                  <ul className="space-y-4">
                    {p.feat.map((f: string) => (
                      <li key={f} className="flex gap-3 items-start text-slate-600 font-bold text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/register?plan=${p.name.toLowerCase()}&lang=${lang.code}`} className={`w-full h-16 rounded-2xl flex items-center justify-center font-bold text-sm uppercase tracking-widest transition-all relative z-10 ${p.popular ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105' : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-primary hover:text-primary'}`}>{content.select}</Link>
              </div>
            </ScaleIn>
          ))}
        </div>
        <FadeUp delay={0.4}><p className="text-center mt-12 text-slate-400 text-xs font-medium">{content.footer}</p></FadeUp>
      </div>
    </section>
  );
}

function TestimonialsSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.testimonials || translations.ES.testimonials;
  return (
    <section id="testimonials" className="py-40 bg-white text-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-center">
        <ScaleIn><div className="relative"><div className="absolute -inset-10 bg-primary/5 blur-[100px]" /><img src="/images/hero-features.png" className="relative w-full mx-auto rounded-[2rem] shadow-2xl border border-slate-100" alt="MyDigitable Features" /></div></ScaleIn>
        <div className="space-y-12">
          <Star className="text-accent w-12 h-12 fill-accent" />
          <p className="text-4xl lg:text-5xl font-light italic leading-snug tracking-tight text-foreground">"{content.quote}"</p>
          <div className="pt-8 border-t border-slate-100"><p className="text-2xl font-bold">{content.author}</p><p className="text-xs font-black uppercase tracking-[0.4em] text-slate-300">{content.role}</p></div>
        </div>
      </div>
    </section>
  );
}

function FAQSection({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.faq || translations.ES.faq;
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-40 bg-slate-50 text-foreground">
      <div className="max-w-4xl mx-auto px-6 text-center mb-24">
        <FadeUp><h2 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">FAQ<span className="text-primary italic">.</span></h2></FadeUp>
        <p className="text-xl text-muted-foreground">{content.desc}</p>
      </div>
      <div className="max-w-3xl mx-auto px-6 space-y-4">
        {content.questions.map((q: Record<string, string>, i: number) => (
          <div key={i} className={`p-10 rounded-3xl border transition-all cursor-pointer bg-white ${open === i ? 'border-primary shadow-xl scale-[1.02]' : 'border-slate-100 grayscale opacity-60'}`} onClick={() => setOpen(i)}>
            <div className="flex justify-between items-center font-bold text-2xl">{q.q} <Plus className={`transition-transform duration-500 ${open === i ? 'rotate-45 text-primary' : ''}`} /></div>
            <AnimatePresence>{open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="mt-4 pt-4 border-t border-slate-100 text-muted-foreground font-light leading-relaxed">{q.a}</p></motion.div>}</AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ lang }: { lang: { code: string; flag: string } }) {
  const content = translations[lang.code]?.finalCta || translations.ES.finalCta;
  return (
    <section className="py-40 bg-primary/10 text-center text-foreground">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        <h2 className="text-7xl lg:text-9xl font-semibold tracking-tighter leading-none">{content.title}</h2>
        <p className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto">{content.desc}</p>
        <Link href={`/register?lang=${lang.code}`} className="inline-flex h-24 px-20 bg-primary text-white rounded-full text-2xl font-black uppercase tracking-[0.2em] shadow-2xl items-center hover:scale-105 transition-transform">{content.btn}</Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-24 border-t border-border bg-white text-center text-foreground">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
        <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-white italic"><span className="text-white">M</span></div><span className="font-bold text-2xl">MyDigitable</span></Link>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-300"><span>INSTAGRAM</span><span>LINKEDIN</span><span>LEGAL</span></div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState(languages[0]);
  return (
    <div className="bg-white text-foreground min-h-screen font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar lang={lang} onSelectLang={setLang} />
      <HeroSection lang={lang} />
      <LogosSection lang={lang} />
      <FeaturesSection lang={lang} />
      <ShowcaseSection lang={lang} />
      <HowItWorksSection lang={lang} />
      <PricingSection lang={lang} />
      <TestimonialsSection lang={lang} />
      <FAQSection lang={lang} />
      <FinalCTA lang={lang} />
      <Footer />
    </div>
  );
}

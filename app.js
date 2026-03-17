let deferredPwaPrompt = null;

// Captura global do evento antes da inicialização do Alpine
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPwaPrompt = event;
  window.dispatchEvent(new CustomEvent("pwa-install-available"));
});

function landingApp() {
  return {
    theme: "theme-dark",
    hero: {
      subtitle: "",
      badges: [],
    },
    vantagens: [],
    servicos: {
      fluxo: [],
      conteudos: [],
    },
    sobre: {
      resumo: "",
      missao: "",
      visao: "",
      valores: [],
    },
    experiencia: {
      carroImagem: "",
      carroDescricao: "",
      videoUrl: "",
      feedbacks: [],
    },
    cnh: {
      titulo: "",
      descricao: "",
      texto: "",
      ctaLabel: "",
      url: "",
    },
    planos: [],
    whatsapp: {
      display: "",
      url: "",
      ctaLabel: "Chamar no WhatsApp",
      horario: "",
      regioes: "",
    },
    contato: {
      enderecoTitulo: "",
      enderecoLinha: "",
      mapaEmbed: "",
      infoExtra: "",
    },
    redes: [],
    aprovados: {
      titulo: "",
      descricao: "",
      imagens: [],
      videoConvite: ""
    },
    aprovadosCurrentIndex: 0,
    aprovadosIntervalId: null,
    aprovadosModalOpen: false,
    aprovadosModalImage: null,
    canInstall: false,

    async init() {
      // Service Worker já foi registrado no HTML antes do Alpine
      // Carrega os dados
      await this.loadData();
      // Inicializa animações
      this.initScrollAnimations();
      // Configura o prompt de instalação
      this.setupInstallPrompt();
      // Inicia slider de aprovados
      this.startAprovadosSlider();
    },

    async loadData() {
      try {
        // Detecta base path para GitHub Pages
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
        const dataPath = basePath ? `${basePath}/data.json` : './data.json';
        const response = await fetch(dataPath);
        const data = await response.json();

        this.hero = data.hero;
        this.vantagens = data.vantagens;
        this.servicos = data.servicos;
        this.sobre = data.sobre;
        this.planos = data.planos;
        this.whatsapp = data.whatsapp;
        this.contato = data.contato;
        this.redes = data.redes;
        this.experiencia = data.experiencia;
        this.cnh = data.cnh;
        this.aprovados = data.aprovados;
      } catch (error) {
        // Em produção, você poderia logar isso em algum serviço
        console.error("Erro ao carregar data.json", error);
      }
    },

    scrollToSection(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const headerOffset = 80;
      const rect = el.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    },

    initScrollAnimations() {
      const elements = document.querySelectorAll(".animate-on-scroll");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18 }
      );

      elements.forEach((el) => observer.observe(el));
    },

    // Slider de aprovados
    nextAprovadosSlide() {
      if (!this.aprovados.imagens.length) return;
      this.aprovadosCurrentIndex =
        (this.aprovadosCurrentIndex + 1) % this.aprovados.imagens.length;
    },

    prevAprovadosSlide() {
      if (!this.aprovados.imagens.length) return;
      this.aprovadosCurrentIndex =
        (this.aprovadosCurrentIndex - 1 + this.aprovados.imagens.length) %
        this.aprovados.imagens.length;
    },

    goToAprovadosSlide(index) {
      if (!this.aprovados.imagens.length) return;
      this.aprovadosCurrentIndex = index;
    },

    startAprovadosSlider() {
      if (this.aprovadosIntervalId || !this.aprovados.imagens.length) return;
      this.aprovadosIntervalId = setInterval(() => {
        this.nextAprovadosSlide();
      }, 5000);
    },

    stopAprovadosSlider() {
      if (this.aprovadosIntervalId) {
        clearInterval(this.aprovadosIntervalId);
        this.aprovadosIntervalId = null;
      }
    },

    openAprovadosModal(img) {
      this.aprovadosModalImage = img;
      this.aprovadosModalOpen = true;
      this.stopAprovadosSlider();
    },

    closeAprovadosModal() {
      this.aprovadosModalOpen = false;
      this.aprovadosModalImage = null;
      this.startAprovadosSlider();
    },

    setupInstallPrompt() {
      // Atualiza o estado quando o evento global for disparado
      window.addEventListener("pwa-install-available", () => {
        this.canInstall = true;
      });

      // Caso o evento já tenha ocorrido antes do Alpine iniciar
      if (deferredPwaPrompt) {
        this.canInstall = true;
      }
    },

    async promptInstall() {
      if (!deferredPwaPrompt) return;
      deferredPwaPrompt.prompt();
      const choice = await deferredPwaPrompt.userChoice;
      if (choice.outcome === "accepted") {
        this.canInstall = false;
      }
      deferredPwaPrompt = null;
    },
  };
}


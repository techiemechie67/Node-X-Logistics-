/**
 * TechieMechie & Node-X-Logistics — LogoLoop Engine (React Bits Port)
 * Continuous infinite ticker with smooth sub-pixel velocity physics,
 * exponential tau easing, ResizeObserver dynamic copy budgeting, hover deceleration,
 * and seamless dual-sector tab switching (TECH vs COMPANIES).
 */

class VanillaLogoLoop {
  constructor(container, options = {}) {
    this.container = typeof container === "string" ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign(
      {
        logos: [],
        speed: 80,
        direction: "left",
        width: "100%",
        logoHeight: 32,
        gap: 36,
        pauseOnHover: true,
        hoverSpeed: 0,
        fadeOut: true,
        fadeOutColor: "#000000",
        scaleOnHover: true,
        ariaLabel: "Technologies and partner logos ticker"
      },
      options
    );

    this.SMOOTH_TAU = 0.25;
    this.MIN_COPIES = 2;
    this.COPY_HEADROOM = 2;

    this.offset = 0;
    this.velocity = 0;
    this.lastTimestamp = null;
    this.rafId = null;
    this.isHovered = false;
    this.seqWidth = 0;
    this.copyCount = this.MIN_COPIES;

    this.init();
  }

  init() {
    this.isVertical = this.options.direction === "up" || this.options.direction === "down";
    const magnitude = Math.abs(this.options.speed);
    const dirMultiplier = this.options.direction === "left" || this.options.direction === "up" ? 1 : -1;
    this.targetVelocity = magnitude * dirMultiplier;

    this.effectiveHoverSpeed =
      this.options.hoverSpeed !== undefined
        ? this.options.hoverSpeed
        : this.options.pauseOnHover
        ? 0
        : undefined;

    // Root element setup
    this.root = document.createElement("div");
    this.root.className = [
      "logoloop",
      this.isVertical ? "logoloop--vertical" : "logoloop--horizontal",
      this.options.fadeOut ? "logoloop--fade" : "",
      this.options.scaleOnHover ? "logoloop--scale-hover" : ""
    ]
      .filter(Boolean)
      .join(" ");

    this.root.setAttribute("role", "region");
    this.root.setAttribute("aria-label", this.options.ariaLabel);
    this.root.style.setProperty("--logoloop-gap", `${this.options.gap}px`);
    this.root.style.setProperty("--logoloop-logoHeight", `${this.options.logoHeight}px`);
    if (this.options.fadeOutColor) {
      this.root.style.setProperty("--logoloop-fadeColor", this.options.fadeOutColor);
    }
    if (this.options.width) {
      this.root.style.width = typeof this.options.width === "number" ? `${this.options.width}px` : this.options.width;
    }

    // Track
    this.track = document.createElement("div");
    this.track.className = "logoloop__track";

    // Initial sequence list
    this.seqList = this.createLogoList(0);
    this.track.appendChild(this.seqList);
    this.root.appendChild(this.track);

    this.container.innerHTML = "";
    this.container.appendChild(this.root);

    // Event listeners
    if (this.effectiveHoverSpeed !== undefined) {
      this.track.addEventListener("mouseenter", () => {
        this.isHovered = true;
      });
      this.track.addEventListener("mouseleave", () => {
        this.isHovered = false;
      });
    }

    // Measure & calculate copies
    this.updateDimensions();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(this.root);
      this.resizeObserver.observe(this.seqList);
    } else {
      window.addEventListener("resize", () => this.updateDimensions());
    }

    // Start RAF loop
    this.startAnimation();
  }

  resolveAssetUrl(src) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) return src;
    if (src.startsWith("/")) return src;
    // Normalize relative paths
    const clean = src.replace(/^\.\//, "");
    return "/" + clean;
  }

  createLogoList(copyIndex) {
    const ul = document.createElement("ul");
    ul.className = "logoloop__list";
    ul.setAttribute("role", "list");
    if (copyIndex > 0) {
      ul.setAttribute("aria-hidden", "true");
    }

    this.options.logos.forEach(item => {
      const li = document.createElement("li");
      li.className = "logoloop__item";
      li.setAttribute("role", "listitem");

      let contentEl;
      if (item.node) {
        contentEl = document.createElement("span");
        contentEl.className = "logoloop__node";
        if (typeof item.node === "string") {
          contentEl.innerHTML = item.node;
        } else if (item.node instanceof HTMLElement) {
          contentEl.appendChild(item.node);
        }
      } else if (item.src) {
        const chip = document.createElement("div");
        chip.className = "stack-logo-chip";
        chip.setAttribute("title", item.title || item.alt || "");
        
        const img = document.createElement("img");
        img.className = "stack-logo-img";
        img.src = this.resolveAssetUrl(item.src);
        img.alt = item.alt || item.title || "";
        img.title = item.title || "";
        img.loading = "eager";
        img.decoding = "sync";
        img.draggable = false;
        chip.appendChild(img);

        contentEl = chip;
      }

      if (item.href && contentEl) {
        const link = document.createElement("a");
        link.className = "logoloop__link";
        link.href = item.href;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.setAttribute("aria-label", item.title || item.alt || "link");
        link.appendChild(contentEl);
        li.appendChild(link);
      } else if (contentEl) {
        li.appendChild(contentEl);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  updateDimensions() {
    const containerWidth = this.root.clientWidth || this.container.clientWidth || 1200;
    const rect = this.seqList.getBoundingClientRect();
    const sequenceWidth = rect.width || 0;

    if (sequenceWidth > 0) {
      this.seqWidth = Math.ceil(sequenceWidth);
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + this.COPY_HEADROOM;
      const targetCopies = Math.max(this.MIN_COPIES, copiesNeeded);

      if (targetCopies !== this.copyCount) {
        this.copyCount = targetCopies;
        this.rebuildCopies();
      }
    }
  }

  rebuildCopies() {
    this.track.innerHTML = "";
    this.seqList = this.createLogoList(0);
    this.track.appendChild(this.seqList);

    for (let i = 1; i < this.copyCount; i++) {
      this.track.appendChild(this.createLogoList(i));
    }
  }

  setLogos(newLogos, ariaLabel) {
    this.options.logos = newLogos;
    if (ariaLabel) {
      this.options.ariaLabel = ariaLabel;
      this.root.setAttribute("aria-label", ariaLabel);
    }
    this.offset = 0;
    this.rebuildCopies();
    this.updateDimensions();
  }

  startAnimation() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      this.track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const animate = timestamp => {
      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const target = this.isHovered && this.effectiveHoverSpeed !== undefined ? this.effectiveHoverSpeed : this.targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / this.SMOOTH_TAU);
      this.velocity += (target - this.velocity) * easingFactor;

      if (this.seqWidth > 0) {
        let nextOffset = this.offset + this.velocity * deltaTime;
        nextOffset = ((nextOffset % this.seqWidth) + this.seqWidth) % this.seqWidth;
        this.offset = nextOffset;

        this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
      }

      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// ==============================================================================
// SECTOR DATASETS (TECH vs COMPANIES)
// ==============================================================================

const TECH_LOGOS = [
  {
    title: "ChatGPT",
    alt: "ChatGPT",
    src: "/assets/tech/chatgpt.svg",
    href: "https://chatgpt.com/"
  },
  {
    title: "Claude",
    alt: "Claude",
    src: "/assets/tech/claude.svg",
    href: "https://claude.ai/"
  },
  {
    title: "Antigravity",
    alt: "Antigravity",
    src: "/assets/tech/antigravity.svg",
    href: "https://github.com/google/antigravity"
  },
  {
    title: "ElevenLabs",
    alt: "ElevenLabs",
    src: "/assets/tech/elevenlabs.svg",
    href: "https://elevenlabs.io/"
  },
  {
    title: "Google Gemini",
    alt: "Google Gemini",
    src: "/assets/tech/gemini.svg",
    href: "https://gemini.google.com/"
  },
  {
    title: "GitHub",
    alt: "GitHub",
    src: "/assets/tech/github.svg",
    href: "https://github.com/"
  },
  {
    title: "React",
    alt: "React",
    src: "/assets/tech/react.svg",
    href: "https://react.dev/"
  },
  {
    title: "Vite",
    alt: "Vite",
    src: "/assets/tech/vite.svg",
    href: "https://vite.dev/"
  },
  {
    title: "Three.js",
    alt: "Three.js",
    src: "/assets/tech/threejs.svg",
    href: "https://threejs.org/"
  },
  {
    title: "FastAPI / Python",
    alt: "FastAPI / Python",
    src: "/assets/tech/python.svg",
    href: "https://fastapi.tiangolo.com/"
  },
  {
    title: "TypeScript",
    alt: "TypeScript",
    src: "/assets/tech/typescript.svg",
    href: "https://www.typescriptlang.org/"
  }
];

const COMPANY_LOGOS = [
  {
    title: "Classic Shipping",
    alt: "Classic Shipping Co.",
    src: "/assets/company/classic_shipping.png",
    href: "https://www.classicshipping.in/index.php"
  },
  {
    title: "J.P. Morgan",
    alt: "J.P. Morgan",
    src: "/assets/company/J-P-_Morgan_Logo_1.svg",
    href: "https://www.jpmorgan.com/"
  },
  {
    title: "Apple",
    alt: "Apple",
    src: "/assets/company/apple.svg",
    href: "https://www.apple.com/"
  },
  {
    title: "Maersk",
    alt: "Maersk",
    src: "/assets/company/maersk.svg",
    href: "https://www.maersk.com/"
  },
  {
    title: "FedEx",
    alt: "FedEx",
    src: "/assets/company/Fedex.svg",
    href: "https://www.fedex.com/"
  },
  {
    title: "MSC",
    alt: "MSC",
    src: "/assets/company/MSC_Logo_1.svg",
    href: "https://www.msc.com/"
  },
  {
    title: "Citi",
    alt: "Citi",
    src: "/assets/company/citi.svg",
    href: "https://www.citi.com/"
  },
  {
    title: "Standard Chartered",
    alt: "Standard Chartered",
    src: "/assets/company/Standard_Chartered_Symbol_1.svg",
    href: "https://www.sc.com/"
  }
];

// Global Instances
let stackLogoLoopInstance = null;

function switchStackTab(tabKey) {
  const techTabBtn = document.getElementById("tabBtnTech");
  const compTabBtn = document.getElementById("tabBtnCompanies");
  const subHeading = document.getElementById("stackSubHeading");

  if (!techTabBtn || !compTabBtn || !stackLogoLoopInstance) return;

  if (tabKey === "tech") {
    techTabBtn.classList.add("active");
    techTabBtn.setAttribute("aria-selected", "true");
    compTabBtn.classList.remove("active");
    compTabBtn.setAttribute("aria-selected", "false");
    
    if (subHeading) {
      subHeading.style.opacity = "0";
      setTimeout(() => {
        subHeading.textContent = "TECH WE USE";
        subHeading.style.opacity = "1";
      }, 150);
    }

    stackLogoLoopInstance.setLogos(TECH_LOGOS, "Technologies and tools we use");
  } else {
    compTabBtn.classList.add("active");
    compTabBtn.setAttribute("aria-selected", "true");
    techTabBtn.classList.remove("active");
    techTabBtn.setAttribute("aria-selected", "false");

    if (subHeading) {
      subHeading.style.opacity = "0";
      setTimeout(() => {
        subHeading.textContent = "COMPANIES THAT INSPIRE US";
        subHeading.style.opacity = "1";
      }, 150);
    }

    stackLogoLoopInstance.setLogos(COMPANY_LOGOS, "Companies that inspire us");
  }
}

// Auto-Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const stackContainer = document.getElementById("stackLogoLoopContainer");
  if (stackContainer) {
    stackLogoLoopInstance = new VanillaLogoLoop(stackContainer, {
      logos: TECH_LOGOS,
      speed: 75,
      direction: "left",
      logoHeight: 68,
      gap: 20,
      fadeOut: true,
      fadeOutColor: "#000000",
      scaleOnHover: true,
      pauseOnHover: true,
      ariaLabel: "Technologies we use"
    });
  }

  const partnerContainer = document.getElementById("partnerLogoLoop");
  if (partnerContainer) {
    new VanillaLogoLoop(partnerContainer, {
      logos: COMPANY_LOGOS,
      speed: 80,
      direction: "left",
      logoHeight: 68,
      gap: 20,
      fadeOut: true,
      fadeOutColor: "#000000",
      scaleOnHover: true,
      pauseOnHover: true,
      ariaLabel: "Institutional Partners and Ecosystem"
    });
  }
});

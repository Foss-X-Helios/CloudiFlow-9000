import anime from "animejs";
import {
  ArrowRight,
  Boxes,
  Cable,
  Cloud,
  Database,
  Download,
  FileCode,
  GitBranch,
  Globe,
  HardDrive,
  MousePointerClick,
  Network,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { HeroGraph } from "~/components/landing/HeroGraph";
import { isOnboarded } from "~/lib/store";

export function meta() {
  return [
    { title: "CloudiFlow-9000 - Visual IaC Generator" },
    {
      name: "description",
      content:
        "Build cloud infrastructure visually and generate Terraform, Pulumi, or Ansible code",
    },
  ];
}

// --- Particle field ---
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = document.documentElement.scrollHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      phase: number;
    }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.15 - 0.05,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.1 + 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let frame: number;
    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx + Math.sin(t + p.phase) * 0.08;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        ctx.fillStyle = `rgba(243, 128, 32, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// --- Animated code block ---
function AnimatedCode() {
  const codeRef = useRef<HTMLPreElement>(null);
  const [activeFormat, setActiveFormat] = useState(0);

  const codeSnippets = [
    {
      label: "Terraform",
      code: `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "core-network"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "web-server"
  }
}`,
    },
    {
      label: "Pulumi",
      code: `const vpc = new aws.ec2.Vpc("main", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  tags: { Name: "core-network" },
});

const instance = new aws.ec2.Instance("web", {
  ami: "ami-0c55b159cbfafe1f0",
  instanceType: "t3.micro",
  subnetId: publicSubnet.id,
  tags: { Name: "web-server" },
});`,
    },
    {
      label: "Ansible",
      code: `- name: Create VPC
  amazon.aws.ec2_vpc_net:
    name: core-network
    cidr_block: 10.0.0.0/16
    region: us-east-1
    state: present

- name: Launch EC2 instance
  amazon.aws.ec2_instance:
    name: web-server
    instance_type: t3.micro
    image_id: ami-0c55b159cbfafe1f0
    state: running`,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFormat((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (codeRef.current) {
      anime({
        targets: codeRef.current,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        easing: "easeOutCubic",
      });
    }
  }, []);

  return (
    <div className="code-preview-block relative rounded-2xl border border-[#1a1a1a] bg-[#0c0c0c] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        {codeSnippets.map((s, i) => (
          <button
            type="button"
            key={s.label}
            onClick={() => setActiveFormat(i)}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-300 ${
              i === activeFormat
                ? "bg-[#f38020]/15 text-[#f38020]"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
        </div>
      </div>
      {/* Code */}
      <div className="p-5 h-[320px] overflow-hidden">
        <pre
          ref={codeRef}
          className="text-[12px] font-mono leading-[1.7] text-[#888] whitespace-pre"
        >
          {codeSnippets[activeFormat].code}
        </pre>
      </div>
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0c0c0c] to-transparent pointer-events-none" />
    </div>
  );
}

// --- Provider logo orbs ---
function ProviderOrbs() {
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbsRef.current) return;
    anime({
      targets: orbsRef.current.querySelectorAll(".provider-orb"),
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(120, { start: 200 }),
      easing: "easeOutBack",
    });
  }, []);

  const providers = [
    { name: "AWS", color: "#FF9900" },
    { name: "GCP", color: "#4285F4" },
    { name: "Azure", color: "#0078D4" },
  ];

  return (
    <div ref={orbsRef} className="flex items-center gap-4">
      {providers.map((p) => (
        <div
          key={p.name}
          className="provider-orb flex items-center gap-2 px-4 py-2 rounded-full border border-[#1f1f1f] bg-[#111] opacity-0"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}40`,
            }}
          />
          <span className="text-[12px] font-medium text-[#999]">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

// --- Main landing ---
export default function Landing() {
  const ctaLink =
    typeof window !== "undefined" && isOnboarded()
      ? "/dashboard"
      : "/onboarding";

  const howItWorksRef = useRef<HTMLDivElement>(null);
  const codeShowcaseRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const providersRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const animatedSections = useRef(new Set<string>());

  const observeAndAnimate = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.section;
          if (!id || animatedSections.current.has(id)) continue;
          animatedSections.current.add(id);

          if (id === "how-it-works") {
            // Stagger the step cards
            anime({
              targets: ".step-card",
              opacity: [0, 1],
              translateY: [50, 0],
              duration: 700,
              delay: anime.stagger(200),
              easing: "easeOutCubic",
            });
            // Animate the connector lines
            anime({
              targets: ".step-connector",
              scaleX: [0, 1],
              opacity: [0, 1],
              duration: 500,
              delay: anime.stagger(200, { start: 400 }),
              easing: "easeOutCubic",
            });
          }

          if (id === "code-showcase") {
            anime({
              targets: ".code-showcase-text",
              opacity: [0, 1],
              translateX: [-40, 0],
              duration: 700,
              delay: anime.stagger(100),
              easing: "easeOutCubic",
            });
            anime({
              targets: ".code-preview-block",
              opacity: [0, 1],
              translateX: [40, 0],
              duration: 800,
              delay: 200,
              easing: "easeOutCubic",
            });
          }

          if (id === "features") {
            anime({
              targets: ".feature-card",
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.95, 1],
              duration: 600,
              delay: anime.stagger(120),
              easing: "easeOutCubic",
            });
          }

          if (id === "providers") {
            anime({
              targets: ".providers-content",
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 700,
              easing: "easeOutCubic",
            });
          }

          if (id === "bottom-cta") {
            anime({
              targets: ".cta-content",
              opacity: [0, 1],
              translateY: [30, 0],
              scale: [0.98, 1],
              duration: 700,
              easing: "easeOutCubic",
            });
          }
        }
      },
      { threshold: 0.15 },
    );

    [howItWorksRef, codeShowcaseRef, featuresRef, providersRef, ctaRef].forEach(
      (ref) => {
        if (ref.current) observer.observe(ref.current);
      },
    );

    return observer;
  }, []);

  useEffect(() => {
    // Hero entrance timeline
    const tl = anime.timeline({ easing: "easeOutExpo" });

    tl.add({
      targets: ".nav-bar",
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 600,
    });

    tl.add(
      {
        targets: ".hero-badge",
        opacity: [0, 1],
        translateY: [15, 0],
        scale: [0.9, 1],
        duration: 500,
      },
      "-=200",
    );

    tl.add(
      {
        targets: ".hero-word",
        opacity: [0, 1],
        translateY: [50, 0],
        rotateX: [20, 0],
        duration: 800,
        delay: anime.stagger(70),
      },
      "-=200",
    );

    tl.add(
      {
        targets: ".hero-accent",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
      },
      "-=400",
    );

    tl.add(
      {
        targets: ".hero-desc",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
      },
      "-=300",
    );

    tl.add(
      {
        targets: ".hero-cta-btn",
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
        duration: 600,
        delay: anime.stagger(100),
      },
      "-=200",
    );

    tl.add(
      {
        targets: ".hero-graph",
        opacity: [0, 1],
        translateX: [60, 0],
        scale: [0.95, 1],
        duration: 900,
        easing: "easeOutCubic",
      },
      "-=800",
    );

    tl.add(
      {
        targets: ".hero-stat",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(80),
      },
      "-=400",
    );

    const observer = observeAndAnimate();
    return () => observer.disconnect();
  }, [observeAndAnimate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e3e3e3] overflow-x-hidden">
      <ParticleField />

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[5%] w-[700px] h-[700px] bg-[radial-gradient(ellipse,rgba(243,128,32,0.035)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[0%] w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(243,128,32,0.025)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Navbar */}
      <header className="nav-bar fixed top-0 left-0 right-0 h-16 border-b border-[#151515] flex items-center justify-between px-8 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 opacity-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f38020] to-[#e06000] flex items-center justify-center shadow-[0_0_20px_rgba(243,128,32,0.2)]">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            CloudiFlow-9000
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-[13px] text-[#666] hover:text-white transition-colors hidden sm:block"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-[13px] text-[#666] hover:text-white transition-colors hidden sm:block"
          >
            Features
          </a>
          <Link
            to={ctaLink}
            className="group px-5 py-2 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-lg text-[13px] font-medium transition-all duration-300 shadow-[0_0_20px_rgba(243,128,32,0.15)] hover:shadow-[0_0_30px_rgba(243,128,32,0.3)]"
          >
            Get Started
            <ArrowRight className="inline w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* ============ HERO ============ */}
        <section className="relative max-w-6xl mx-auto px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 max-w-xl">
              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1f1f1f] bg-[#111] mb-8 opacity-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f38020] animate-pulse" />
                <span className="text-[11px] text-[#888] font-medium tracking-wide">
                  Open Source Visual IaC Builder
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-4"
                style={{ perspective: "800px" }}
              >
                <span className="hero-word inline-block opacity-0">
                  Design{" "}
                </span>
                <span className="hero-word inline-block opacity-0">your </span>
                <span className="hero-word inline-block opacity-0">cloud </span>
                <br className="hidden md:block" />
                <span className="hero-word inline-block opacity-0">
                  infrastructure
                </span>
              </h1>
              <h1 className="hero-accent text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mb-8 opacity-0">
                <span className="bg-gradient-to-r from-[#f38020] via-[#ff9a44] to-[#f38020] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
                  visually.
                </span>
              </h1>

              <p className="hero-desc text-[15px] sm:text-[16px] text-[#666] leading-relaxed max-w-md mb-10 opacity-0">
                Drag cloud components onto a canvas. Connect them. Export
                production-ready Terraform, Pulumi, or Ansible — instantly.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  to={ctaLink}
                  className="hero-cta-btn group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-xl text-[14px] font-semibold transition-all duration-300 shadow-[0_4px_25px_rgba(243,128,32,0.25)] hover:shadow-[0_8px_40px_rgba(243,128,32,0.4)] hover:translate-y-[-2px] opacity-0"
                >
                  Start building
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="hero-cta-btn px-6 py-3.5 text-[#666] hover:text-white text-[14px] font-medium transition-colors duration-300 opacity-0"
                >
                  See how it works
                </a>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-8">
                {[
                  { value: "3", label: "Providers" },
                  { value: "3", label: "Output Formats" },
                  { value: "100%", label: "Local" },
                ].map((stat) => (
                  <div key={stat.label} className="hero-stat opacity-0">
                    <div className="text-[18px] font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-[#555] uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end">
              <HeroGraph />
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section
          id="how-it-works"
          ref={howItWorksRef}
          data-section="how-it-works"
          className="relative max-w-5xl mx-auto px-8 py-24"
        >
          <div className="text-center mb-16">
            <p className="text-[11px] text-[#f38020] uppercase tracking-[0.3em] font-medium mb-3">
              Workflow
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Three steps. Zero boilerplate.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines between steps (desktop only) */}
            <div className="step-connector hidden md:block absolute top-16 left-[33.3%] w-[33.3%] h-px bg-gradient-to-r from-[#f38020]/30 to-[#f38020]/10 origin-left opacity-0" />
            <div className="step-connector hidden md:block absolute top-16 left-[66.6%] w-[33.3%] h-px bg-gradient-to-r from-[#f38020]/10 to-[#f38020]/30 origin-left opacity-0" />

            {[
              {
                step: "01",
                icon: <MousePointerClick className="w-6 h-6" />,
                title: "Drag & Drop",
                desc: "Pick cloud components from the panel — EC2, S3, VPCs, databases — and drop them onto your canvas.",
              },
              {
                step: "02",
                icon: <Cable className="w-6 h-6" />,
                title: "Connect",
                desc: "Draw connections between resources. The visual graph becomes your architecture diagram and your source of truth.",
              },
              {
                step: "03",
                icon: <Download className="w-6 h-6" />,
                title: "Export",
                desc: "Hit copy or download. Get production-ready IaC code in Terraform, Pulumi, or Ansible — your choice.",
              },
            ].map((item, _i) => (
              <div
                key={item.step}
                className="step-card relative p-7 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]/80 group hover:border-[#f38020]/20 transition-all duration-500 opacity-0"
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-1 text-[48px] font-black text-[#111] leading-none select-none group-hover:text-[#1a1a1a] transition-colors duration-500">
                  {item.step}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl border border-[#1f1f1f] bg-[#111] flex items-center justify-center mb-5 text-[#f38020] group-hover:border-[#f38020]/30 group-hover:bg-[#f38020]/5 group-hover:shadow-[0_0_20px_rgba(243,128,32,0.08)] transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-[#555] leading-relaxed group-hover:text-[#777] transition-colors duration-300">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CODE SHOWCASE ============ */}
        <section
          ref={codeShowcaseRef}
          data-section="code-showcase"
          className="relative max-w-6xl mx-auto px-8 py-24"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 max-w-md">
              <p className="code-showcase-text text-[11px] text-[#f38020] uppercase tracking-[0.3em] font-medium mb-3 opacity-0">
                Output
              </p>
              <h2 className="code-showcase-text text-3xl sm:text-4xl font-bold text-white mb-6 opacity-0">
                One design,
                <br />
                three formats.
              </h2>
              <p className="code-showcase-text text-[15px] text-[#666] leading-relaxed mb-8 opacity-0">
                Your visual architecture exports to Terraform HCL, Pulumi
                TypeScript, or Ansible YAML. Switch between them with a single
                click — no rework.
              </p>
              <div className="code-showcase-text flex flex-wrap gap-3 opacity-0">
                {[
                  {
                    icon: <FileCode className="w-3.5 h-3.5" />,
                    label: "Terraform HCL",
                  },
                  {
                    icon: <GitBranch className="w-3.5 h-3.5" />,
                    label: "Pulumi TS",
                  },
                  {
                    icon: <Boxes className="w-3.5 h-3.5" />,
                    label: "Ansible YAML",
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#1f1f1f] bg-[#111] text-[12px] text-[#888] font-medium"
                  >
                    <span className="text-[#f38020]">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <AnimatedCode />
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section
          id="features"
          ref={featuresRef}
          data-section="features"
          className="relative max-w-5xl mx-auto px-8 py-24"
        >
          <div className="text-center mb-16">
            <p className="text-[11px] text-[#f38020] uppercase tracking-[0.3em] font-medium mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need to ship infra.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Visual Canvas",
                desc: "Infinite canvas with snap-to-grid, zoom, and minimap. Design at any scale.",
              },
              {
                icon: <Network className="w-5 h-5" />,
                title: "Smart Connections",
                desc: "Drag between handles to create relationships. Animated edges show data flow direction.",
              },
              {
                icon: <FileCode className="w-5 h-5" />,
                title: "Real-time Code Gen",
                desc: "Code updates live as you build. See exactly what will be deployed, instantly.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "Multi-Provider",
                desc: "AWS, GCP, and Azure components in one tool. Switch providers per project to compare.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Fully Local",
                desc: "Runs on your machine. No cloud accounts, no telemetry, no data leaves your environment.",
              },
              {
                icon: <Server className="w-5 h-5" />,
                title: "Component Library",
                desc: "EC2, Lambda, VPC, RDS, S3, Load Balancers, Security Groups, Route53, and more.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card group relative p-6 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]/50 hover:border-[#f38020]/20 transition-all duration-500 hover:bg-[#111]/80 opacity-0"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[rgba(243,128,32,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg border border-[#1f1f1f] bg-[#111] flex items-center justify-center mb-4 text-[#f38020] group-hover:border-[#f38020]/30 group-hover:shadow-[0_0_15px_rgba(243,128,32,0.08)] transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-[#555] leading-relaxed group-hover:text-[#777] transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ PROVIDERS ============ */}
        <section
          ref={providersRef}
          data-section="providers"
          className="relative max-w-5xl mx-auto px-8 py-20"
        >
          <div className="providers-content rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]/60 p-10 sm:p-14 text-center opacity-0">
            <div className="flex justify-center gap-6 mb-8">
              {[
                { icon: <Server className="w-5 h-5" />, label: "Compute" },
                { icon: <Database className="w-5 h-5" />, label: "Database" },
                { icon: <HardDrive className="w-5 h-5" />, label: "Storage" },
                { icon: <Network className="w-5 h-5" />, label: "Network" },
                { icon: <Shield className="w-5 h-5" />, label: "Security" },
                { icon: <Globe className="w-5 h-5" />, label: "DNS" },
              ].map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-xl border border-[#1f1f1f] bg-[#111] flex items-center justify-center text-[#f38020]">
                    {c.icon}
                  </div>
                  <span className="text-[10px] text-[#555] uppercase tracking-wider font-medium">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Full component library across all major clouds.
            </h3>
            <p className="text-[14px] text-[#666] max-w-lg mx-auto mb-8">
              Every resource type you need — from compute instances and
              databases to networking and security groups. Each with
              configurable properties.
            </p>
            <div className="flex justify-center">
              <ProviderOrbs />
            </div>
          </div>
        </section>

        {/* ============ BOTTOM CTA ============ */}
        <section
          ref={ctaRef}
          data-section="bottom-cta"
          className="relative max-w-5xl mx-auto px-8 pt-16 pb-24"
        >
          <div className="cta-content text-center opacity-0">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f38020] to-[#e06000] mb-6 shadow-[0_0_40px_rgba(243,128,32,0.2)]">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to build?
            </h2>
            <p className="text-[15px] text-[#666] max-w-md mx-auto mb-8">
              Go from blank canvas to deployable infrastructure in minutes. No
              sign-up, no API keys, no cloud credentials needed.
            </p>
            <Link
              to={ctaLink}
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-xl text-[15px] font-semibold transition-all duration-300 shadow-[0_4px_30px_rgba(243,128,32,0.25)] hover:shadow-[0_8px_50px_rgba(243,128,32,0.4)] hover:translate-y-[-2px]"
            >
              Open the Editor
              <ArrowRight className="w-4.5 h-4.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-[#141414] py-8 px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12px] text-[#444]">
              <Cloud className="w-3.5 h-3.5 text-[#f38020]" />
              <span>CloudiFlow-9000</span>
            </div>
            <p className="text-[12px] text-[#333]">
              Open source. Runs locally. Your infrastructure, your rules.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

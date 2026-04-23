"use client";

import { Box, Button } from "@chakra-ui/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useMemo, useRef } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { BeforeAfterSection } from "./sections/BeforeAfterSection";
import { ContactSection } from "./sections/ContactSection";
import { FaqSection } from "./sections/FaqSection";
import { FooterSection } from "./sections/FooterSection";
import { GallerySection } from "./sections/GallerySection";
import { HeaderSection } from "./sections/HeaderSection";
import { HeroSection } from "./sections/HeroSection";
import { ProcessSection } from "./sections/ProcessSection";
import { PricingSection } from "./sections/PricingSection";
import { ServicesSection } from "./sections/ServicesSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { LandingData } from "./sections/types";

const navItems = [
  { label: "Home", id: "home" },
  { label: "Paquetes", id: "servicios" },
  { label: "Proceso", id: "proceso" },
  { label: "Contacto", id: "contacto" },
];

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, Draggable);

const clampProgress = gsap.utils.clamp(0, 1);

type CTAButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline";
  ariaLabel: string;
};

function CTAButton({ children, onClick, variant = "solid", ariaLabel }: CTAButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const pulse = () => {
    if (!buttonRef.current) {
      return;
    }

    gsap.fromTo(
      buttonRef.current,
      {
        scale: 1,
        boxShadow: "0 0 0px rgba(0,191,255,0)",
      },
      {
        scale: 1.04,
        boxShadow: "0 0 18px rgba(0,191,255,0.55)",
        yoyo: true,
        repeat: 1,
        duration: 0.24,
        ease: "power3.out",
      }
    );
  };

  return (
    <Button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={pulse}
      aria-label={ariaLabel}
      bg={variant === "solid" ? "urban.500" : "transparent"}
      border={variant === "outline" ? "1px solid" : "none"}
      borderColor={variant === "outline" ? "urban.500" : "transparent"}
      color={variant === "solid" ? "urban.950" : "urban.100"}
      borderRadius="full"
      px={8}
      _hover={{
        bg: variant === "solid" ? "urban.100" : "rgba(0,191,255,0.1)",
        color: variant === "solid" ? "urban.950" : "urban.500",
      }}
      _active={{ transform: "scale(0.98)" }}
    >
      {children}
    </Button>
  );
}

function updateReveal(
  sliderRef: React.MutableRefObject<HTMLDivElement | null>,
  afterLayerRef: React.MutableRefObject<HTMLDivElement | null>,
  handleRef: React.MutableRefObject<HTMLDivElement | null>
) {
  if (!sliderRef.current || !afterLayerRef.current || !handleRef.current) {
    return;
  }

  const sliderRect = sliderRef.current.getBoundingClientRect();
  const layerRect = afterLayerRef.current.getBoundingClientRect();
  const handleRect = handleRef.current.getBoundingClientRect();

  const width = layerRect.width || sliderRect.width || sliderRef.current.clientWidth;
  if (width <= 0) {
    return;
  }

  const dividerCenter = handleRect.left - sliderRect.left + handleRect.width / 2;
  const boundedCenter = clampProgress(dividerCenter / width) * width;
  const rightInset = Number(Math.max(0, width - boundedCenter).toFixed(2));

  gsap.set(afterLayerRef.current, {
    clipPath: `inset(0 ${rightInset}px 0 0)`,
  });
}

export function Landing({ data }: { data: LandingData }) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const heroImageRef = useRef<HTMLDivElement | null>(null);
  const servicesGridRef = useRef<HTMLDivElement | null>(null);
  const pricingTableRef = useRef<HTMLDivElement | null>(null);
  const processPinRef = useRef<HTMLDivElement | null>(null);
  const processTrackRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const afterLayerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const testimonialTrackRef = useRef<HTMLDivElement | null>(null);
  const testimonialsSectionRef = useRef<HTMLDivElement | null>(null);
  const gallerySectionRef = useRef<HTMLDivElement | null>(null);
  const beforeAfterSectionRef = useRef<HTMLDivElement | null>(null);
  const faqSectionRef = useRef<HTMLDivElement | null>(null);
  const contactSectionRef = useRef<HTMLDivElement | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);

  const socialIcons = useMemo(
    () => ({
      Instagram: FaInstagram,
      Facebook: FaFacebookF,
      TikTok: FaTiktok,
    }),
    []
  );

  const heroIsVideo = /\.(webm|mp4|ogg)$/i.test(data.images.hero);

  useGSAP(
    () => {
      let splitTextInstance: { chars: Element[]; revert: () => void } | null = null;
      let splitIsMounted = true;
      let resizeHandler: (() => void) | null = null;
      let pointerMoveHandler: ((event: PointerEvent) => void) | null = null;
      let draggableInstances: Draggable[] = [];

      const packageHandlers: Array<{ card: HTMLElement; enter: () => void; leave: () => void }> = [];
      const mm = gsap.matchMedia();

      const animateHeroTargets = (targets: Element[] | NodeListOf<Element>, reduceMotion: boolean) => {
        gsap.fromTo(
          targets,
          {
            yPercent: reduceMotion ? 0 : 115,
            autoAlpha: reduceMotion ? 1 : 0,
            rotateX: reduceMotion ? 0 : -26,
          },
          {
            yPercent: 0,
            autoAlpha: 1,
            rotateX: 0,
            stagger: reduceMotion ? 0 : { each: 0.022, from: "start" },
            duration: reduceMotion ? 0.01 : 1.12,
            ease: "expo.out",
          }
        );
      };

      const loadSplitText = async () => {
        if (!heroTitleRef.current) {
          return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        try {
          const mod = await import("gsap/SplitText");
          if (!splitIsMounted || !heroTitleRef.current) {
            return;
          }

          const SplitText = mod.SplitText;
          gsap.registerPlugin(SplitText);

          splitTextInstance = new SplitText(heroTitleRef.current, {
            type: "chars,words",
            charsClass: "title-letter",
          }) as { chars: Element[]; revert: () => void };

          animateHeroTargets(splitTextInstance.chars, reduceMotion);
        } catch {
          const fallbackTargets = heroTitleRef.current?.querySelectorAll(".hero-word");
          if (fallbackTargets && fallbackTargets.length > 0) {
            animateHeroTargets(fallbackTargets, reduceMotion);
          }
        }
      };

      void loadSplitText();

      mm.add(
        {
          isDesktop: "(min-width: 992px)",
          isMobile: "(max-width: 991px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          const revealDuration = reduceMotion ? 0.01 : isDesktop ? 0.82 : 0.66;
          const revealStagger = reduceMotion ? 0 : isDesktop ? 0.08 : 0.06;

          gsap.set("[data-animate]", {
            autoAlpha: reduceMotion ? 1 : 0,
            y: reduceMotion ? 0 : 24,
          });

          gsap.set(".gallery-item", {
            autoAlpha: reduceMotion ? 1 : 0,
            y: reduceMotion ? 0 : 28,
            scale: reduceMotion ? 1 : 0.98,
          });

          const introTimeline = gsap.timeline({
            defaults: {
              duration: reduceMotion ? 0.01 : 0.88,
              ease: "power3.out",
            },
          });

          if (headerRef.current) {
            introTimeline.fromTo(
              headerRef.current,
              { y: -72, autoAlpha: reduceMotion ? 1 : 0 },
              { y: 0, autoAlpha: 1 },
              0
            );
          }

          if (logoRef.current && !reduceMotion) {
            introTimeline.fromTo(
              logoRef.current,
              { scale: 0.86, autoAlpha: 0 },
              { scale: 1, autoAlpha: 1, duration: 0.64, ease: "back.out(1.6)" },
              0.1
            );

            gsap.to(logoRef.current, {
              filter: "drop-shadow(0 0 16px rgba(87,182,255,0.6))",
              repeat: -1,
              yoyo: true,
              duration: 1.7,
              ease: "sine.inOut",
            });
          }

          introTimeline
            .fromTo(".hero-sub", { y: reduceMotion ? 0 : 34, autoAlpha: reduceMotion ? 1 : 0 }, { y: 0, autoAlpha: 1 }, 0.3)
            .fromTo(
              ".hero-cta > *",
              { y: reduceMotion ? 0 : 32, autoAlpha: reduceMotion ? 1 : 0 },
              { y: 0, autoAlpha: 1, stagger: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0.01 : 0.76, ease: "expo.out" },
              0.44
            );

          if (!reduceMotion) {
            ScrollTrigger.batch("[data-animate]", {
              start: "top 86%",
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: revealDuration,
                  stagger: { each: revealStagger, from: "start" },
                  ease: "power3.out",
                  overwrite: "auto",
                });
              },
            });

            ScrollTrigger.batch(".gallery-item", {
              start: "top 88%",
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: revealDuration,
                  stagger: { each: 0.07, from: "start" },
                  ease: "power3.out",
                  overwrite: "auto",
                });
              },
            });
          }

          const activeHeroMedia = heroVideoRef.current ?? heroImageRef.current;
          if (activeHeroMedia && !reduceMotion) {
            gsap.to(activeHeroMedia, {
              yPercent: -14,
              ease: "none",
              scrollTrigger: {
                trigger: "#home",
                start: "top top",
                end: "bottom top",
                scrub: isDesktop ? 0.95 : 0.65,
                invalidateOnRefresh: true,
              },
            });
          }

          if (pricingTableRef.current) {
            const rows = pricingTableRef.current.querySelectorAll("tbody tr");
            gsap.fromTo(
              rows,
              { autoAlpha: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -20 },
              {
                immediateRender: false,
                autoAlpha: 1,
                x: 0,
                stagger: reduceMotion ? 0 : 0.1,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: pricingTableRef.current,
                  start: "top 84%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (testimonialsSectionRef.current) {
            gsap.fromTo(
              testimonialsSectionRef.current.querySelectorAll(".testimonials-track"),
              { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 },
              {
                immediateRender: false,
                autoAlpha: 1,
                y: 0,
                stagger: reduceMotion ? 0 : 0.12,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: testimonialsSectionRef.current,
                  start: "top 85%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (testimonialTrackRef.current && testimonialsSectionRef.current && !reduceMotion) {
            const marqueeTween = gsap.to(testimonialTrackRef.current, {
              xPercent: -50,
              ease: "none",
              duration: 28,
              repeat: -1,
            });

            ScrollTrigger.create({
              trigger: testimonialsSectionRef.current,
              start: "top bottom",
              end: "bottom top",
              onEnter: () => marqueeTween.play(),
              onLeave: () => marqueeTween.pause(),
              onEnterBack: () => marqueeTween.play(),
              onLeaveBack: () => marqueeTween.pause(),
            });
          }

          if (gallerySectionRef.current && !reduceMotion) {
            gsap.utils.toArray<HTMLElement>(".gallery-item").forEach((item, index) => {
              gsap.to(item, {
                yPercent: index % 2 === 0 ? -5 : 5,
                ease: "none",
                scrollTrigger: {
                  trigger: gallerySectionRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: isDesktop ? 0.9 : 0.6,
                  invalidateOnRefresh: true,
                },
              });
            });
          }

          if (beforeAfterSectionRef.current) {
            gsap.fromTo(
              beforeAfterSectionRef.current.children,
              { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 26 },
              {
                immediateRender: false,
                autoAlpha: 1,
                y: 0,
                stagger: reduceMotion ? 0 : 0.12,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: beforeAfterSectionRef.current,
                  start: "top 84%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (faqSectionRef.current) {
            gsap.fromTo(
              faqSectionRef.current.querySelectorAll(".chakra-accordion__item"),
              { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
              {
                immediateRender: false,
                autoAlpha: 1,
                y: 0,
                stagger: reduceMotion ? 0 : 0.08,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: faqSectionRef.current,
                  start: "top 85%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (contactSectionRef.current) {
            gsap.fromTo(
              contactSectionRef.current.querySelectorAll(".contact-reveal:not([data-animate])"),
              { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 22 },
              {
                immediateRender: false,
                autoAlpha: 1,
                y: 0,
                stagger: reduceMotion ? 0 : 0.1,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: contactSectionRef.current,
                  start: "top 86%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (servicesGridRef.current) {
            const serviceCards = Array.from(servicesGridRef.current.children);
            gsap.fromTo(
              serviceCards,
              {
                y: reduceMotion ? 0 : 22,
                autoAlpha: reduceMotion ? 1 : 0,
              },
              {
                immediateRender: false,
                y: 0,
                autoAlpha: 1,
                stagger: reduceMotion ? 0 : 0.08,
                duration: revealDuration,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: servicesGridRef.current,
                  start: "top 82%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          if (processPinRef.current && processTrackRef.current) {
            if (!reduceMotion && isDesktop) {
              const totalScroll = Math.max(processTrackRef.current.scrollWidth - processPinRef.current.offsetWidth, 0);
              gsap.to(processTrackRef.current, {
                x: -totalScroll,
                ease: "none",
                scrollTrigger: {
                  trigger: processPinRef.current,
                  start: "top top",
                  end: `+=${Math.max(totalScroll + 560, 920)}`,
                  pin: true,
                  scrub: 0.9,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                  refreshPriority: 1,
                },
              });
            } else {
              gsap.fromTo(
                processTrackRef.current.children,
                { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
                {
                  immediateRender: false,
                  autoAlpha: 1,
                  y: 0,
                  stagger: reduceMotion ? 0 : 0.08,
                  duration: revealDuration,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: processPinRef.current,
                    start: "top 84%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }
              );
            }
          }

          gsap.set("[data-nav-item]", {
            color: "#F6FBFF",
            backgroundColor: "transparent",
          });

          gsap.to("[data-nav-item='home']", {
            color: "#1DD6C1",
            backgroundColor: "rgba(29,214,193,0.14)",
            duration: 0,
          });

          gsap.utils.toArray<HTMLElement>("[data-nav-section]").forEach((section) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top 36%",
              end: "bottom 34%",
              onToggle: (state) => {
                const id = section.getAttribute("id");
                if (!id || !state.isActive) {
                  return;
                }

                gsap.to("[data-nav-item]", {
                  color: "#F6FBFF",
                  backgroundColor: "transparent",
                  duration: 0.25,
                  overwrite: true,
                });

                gsap.to(`[data-nav-item='${id}']`, {
                  color: "#1DD6C1",
                  backgroundColor: "rgba(29,214,193,0.14)",
                  duration: 0.25,
                  overwrite: true,
                });
              },
            });
          });
        }
      );

      if (sliderRef.current && afterLayerRef.current && handleRef.current) {
        const sliderWidth = afterLayerRef.current.getBoundingClientRect().width || sliderRef.current.clientWidth;
        const handleWidth = handleRef.current.offsetWidth || 0;
        const maxX = Math.max(sliderWidth - handleWidth, 0);
        const initialX = gsap.utils.clamp(0, maxX, sliderWidth * 0.56 - handleWidth / 2);

        gsap.set(handleRef.current, { x: initialX });
        updateReveal(sliderRef, afterLayerRef, handleRef);

        draggableInstances = Draggable.create(handleRef.current, {
          type: "x",
          bounds: { minX: 0, maxX },
          onDrag: () => updateReveal(sliderRef, afterLayerRef, handleRef),
        });

        resizeHandler = () => {
          if (!sliderRef.current || !afterLayerRef.current || !handleRef.current) {
            return;
          }

          const currentSliderRect = sliderRef.current.getBoundingClientRect();
          const currentHandleRect = handleRef.current.getBoundingClientRect();
          const currentCenterRatio =
            currentSliderRect.width > 0
              ? clampProgress((currentHandleRect.left - currentSliderRect.left + currentHandleRect.width / 2) / currentSliderRect.width)
              : 0.56;

          const nextSliderWidth = afterLayerRef.current.getBoundingClientRect().width || sliderRef.current.clientWidth;
          const nextHandleWidth = handleRef.current.offsetWidth || 0;
          const nextMaxX = Math.max(nextSliderWidth - nextHandleWidth, 0);
          const nextX = gsap.utils.clamp(0, nextMaxX, currentCenterRatio * nextSliderWidth - nextHandleWidth / 2);

          draggableInstances.forEach((instance) => instance.applyBounds({ minX: 0, maxX: nextMaxX }));
          gsap.set(handleRef.current, { x: nextX });
          updateReveal(sliderRef, afterLayerRef, handleRef);
          ScrollTrigger.refresh();
        };

        window.addEventListener("resize", resizeHandler, { passive: true });
      }

      gsap.utils.toArray<HTMLElement>(".package-card").forEach((card) => {
        const icon = card.querySelector(".package-icon");
        const yTo = gsap.quickTo(card, "y", { duration: 0.32, ease: "power3.out" });
        const rotateTo = icon ? gsap.quickTo(icon, "rotation", { duration: 0.35, ease: "power3.out" }) : null;
        const scaleTo = icon ? gsap.quickTo(icon, "scale", { duration: 0.35, ease: "power3.out" }) : null;

        const enter = () => {
          yTo(-9);
          rotateTo?.(7);
          scaleTo?.(1.08);
        };

        const leave = () => {
          yTo(0);
          rotateTo?.(0);
          scaleTo?.(1);
        };

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        packageHandlers.push({ card, enter, leave });
      });

      if (cursorGlowRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cursorGlowRef.current, {
          x: window.innerWidth * 0.45,
          y: window.innerHeight * 0.2,
        });

        const xTo = gsap.quickTo(cursorGlowRef.current, "x", {
          duration: 0.55,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(cursorGlowRef.current, "y", {
          duration: 0.55,
          ease: "power3.out",
        });

        pointerMoveHandler = (event: PointerEvent) => {
          const x = gsap.utils.clamp(0, window.innerWidth, event.clientX);
          const y = gsap.utils.clamp(0, window.innerHeight, event.clientY);
          xTo(x - 140);
          yTo(y - 140);
        };

        window.addEventListener("pointermove", pointerMoveHandler, { passive: true });
      }

      return () => {
        splitIsMounted = false;
        splitTextInstance?.revert();
        packageHandlers.forEach(({ card, enter, leave }) => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });

        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
        }

        if (pointerMoveHandler) {
          window.removeEventListener("pointermove", pointerMoveHandler);
        }

        draggableInstances.forEach((instance) => instance.kill());
        mm.revert();
      };
    },
    { scope: pageRootRef }
  );

  const scrollToSection = (id: string) => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: `#${id}`, offsetY: 90 },
      ease: "expo.out",
      overwrite: "auto",
    });
  };

  const packageRows = data.packages.map((pkg) => ({
    package: pkg.title,
    features: [...pkg.features, `Duración: ${pkg.duration}`],
    price: pkg.price,
  }));

  return (
    <div ref={pageRootRef} className="urban-texture">
      <Box ref={cursorGlowRef} className="floating-glow" aria-hidden="true" />

      <HeaderSection
        headerRef={headerRef}
        logoRef={logoRef}
        navItems={navItems}
        onNavigate={scrollToSection}
        cta={<CTAButton ariaLabel="Agendar servicio ahora" onClick={() => scrollToSection("contacto")}>Agenda Ahora</CTAButton>}
      />

      <HeroSection
        heroIsVideo={heroIsVideo}
        heroSrc={data.images.hero}
        slogan={data.company.slogan}
        heroTitleRef={heroTitleRef}
        heroVideoRef={heroVideoRef}
        heroImageRef={heroImageRef}
        primaryCta={<CTAButton ariaLabel="Ver paquetes" onClick={() => scrollToSection("servicios")}>Ver paquetes</CTAButton>}
        secondaryCta={<CTAButton ariaLabel="Reservar por WhatsApp" variant="outline" onClick={() => window.open(`https://wa.me/${data.company.whatsapp.replace(/\D/g, "")}`, "_blank", "noopener,noreferrer")}>WhatsApp</CTAButton>}
      />

      <Box py={12} overflow="hidden" borderY="1px solid rgba(130,174,255,0.26)">
        <Box className="magic-strip" whiteSpace="nowrap" fontFamily="heading" fontWeight="400" letterSpacing="0.08em" fontSize={{ base: "2.6rem", md: "5rem" }} color="urban.500">
          LET&apos;S MAKE MAGIC • BRILLO URBANO • ECO DETAILING • LET&apos;S MAKE MAGIC • BRILLO URBANO •
        </Box>
      </Box>

      <ServicesSection servicesGridRef={servicesGridRef} packages={data.packages} benefits={data.benefits} company={data.company} />

      <ProcessSection processPinRef={processPinRef} processTrackRef={processTrackRef} processSteps={data.processSteps} />

      <GallerySection gallerySectionRef={gallerySectionRef} images={data.images.gallery} />

      <BeforeAfterSection
        beforeAfterSectionRef={beforeAfterSectionRef}
        sliderRef={sliderRef}
        afterLayerRef={afterLayerRef}
        handleRef={handleRef}
        beforeImage={data.images.beforeAfter.before}
        afterImage={data.images.beforeAfter.after}
      />

      <PricingSection pricingTableRef={pricingTableRef} packageRows={packageRows} />

      <TestimonialsSection
        testimonialsSectionRef={testimonialsSectionRef}
        testimonialTrackRef={testimonialTrackRef}
        testimonials={data.testimonials}
      />

      <FaqSection faqSectionRef={faqSectionRef} faq={data.faq} />

      <ContactSection
        contactSectionRef={contactSectionRef}
        company={data.company}
        cta={<CTAButton ariaLabel="Enviar formulario de contacto">Enviar solicitud</CTAButton>}
      />

      <FooterSection company={data.company} socialIcons={socialIcons} />
    </div>
  );
}

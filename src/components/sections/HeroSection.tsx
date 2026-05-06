import { Box, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

type HeroSectionProps = {
  heroIsVideo: boolean;
  heroSrc: string;
  slogan: string;
  heroTitleRef: React.RefObject<HTMLHeadingElement | null>;
  heroVideoRef: React.RefObject<HTMLVideoElement | null>;
  heroImageRef: React.RefObject<HTMLDivElement | null>;
  primaryCta: ReactNode;
  secondaryCta: ReactNode;
};

export function HeroSection({
  heroIsVideo,
  heroSrc,
  slogan,
  heroTitleRef,
  heroVideoRef,
  heroImageRef,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  return (
    <Box id="home" data-nav-section minH="100svh" position="relative" pt={{ base: 28, md: 36 }} overflow="hidden">
      {heroIsVideo ? (
        <Box ref={heroVideoRef} as="video" position="absolute" inset={0} w="full" h="full" objectFit="cover" autoPlay muted loop playsInline preload="metadata" transform="scale(1.12)" aria-hidden="true">
          <source src={heroSrc} type="video/webm" />
        </Box>
      ) : (
        <Box
          ref={heroImageRef}
          position="absolute"
          inset={0}
          bgImage={`url(${heroSrc})`}
          bgSize="cover"
          bgPos="center"
          transform="scale(1.12)"
        />
      )}

      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(3,6,14,0.32) 0%, rgba(5,10,20,0.92) 72%)" />
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 12% 25%, rgba(29,214,193,0.2), transparent 36%), radial-gradient(circle at 85% 10%, rgba(87,182,255,0.24), transparent 33%)" mixBlendMode="screen" />

      <Container maxW="container.xl" position="relative" zIndex={2}>
        <VStack align="start" spacing={7} py={{ base: 14,}}>
          <Text
            letterSpacing="0.14em"
            color="urban.100"
            textTransform="uppercase"
            fontWeight="600"
            bg="rgba(7,17,36,0.66)"
            border="1px solid rgba(120,166,255,0.3)"
            borderRadius="full"
            px={4}
            py={1.5}
            data-animate
          >
            {slogan}
          </Text>

          <Heading
            ref={heroTitleRef}
            className="hero-title"
            fontSize={{ base: "3.2rem", sm: "4rem", md: "5rem", lg: "6rem", xl: "7rem", "2xl": "8rem" }}
            lineHeight={{ base: 0.9, md: 0.82 }}
            textTransform="uppercase"
            fontWeight="400"
            letterSpacing="0.02em"
          >
            <span className="hero-word">Urban Moto Gleam:</span> <span className="hero-word">Brillo Urbano para Tu Moto</span>
          </Heading>

          <Text className="hero-sub" fontSize={{ base: "lg", md: "2xl" }} maxW="2xl" color="rgba(246,251,255,0.86)" fontWeight="500">
            Detail premium sostenible en Bogotá. Más protección, más estilo, más presencia en cada ruta.
          </Text>

          <HStack spacing={4} className="hero-cta" flexWrap="wrap">
            {primaryCta}
            {secondaryCta}
          </HStack>

          <HStack
            data-animate
            spacing={{ base: 3, md: 5 }}
            pt={{ base: 4, md: 2 }}
            color="rgba(246,251,255,0.76)"
            fontSize={{ base: "sm", sm: "md" }}
            fontWeight="500"
            flexWrap="wrap"
            justifyContent={{ base: "center", md: "start" }}
            w="full"
          >
            <Text>Sin rayones</Text>
            <Text>•</Text>
            <Text>Biodegradable</Text>
            <Text>•</Text>
            <Text>Acabado showroom</Text>
          </HStack>
        </VStack>
      </Container>

      <Box
        display={{ base: "none", lg: "block" }}
        position="absolute"
        right={{ lg: 10, xl: 18 }}
        bottom={{ lg: 12, xl: 16 }}
        zIndex={2}
        className="section-glass"
        borderRadius="2xl"
        px={5}
        py={4}
      >
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="urban.300">Urban Warranty</Text>
        <Text fontSize="2xl" fontFamily="heading" lineHeight={0.95}>48h</Text>
        <Text color="rgba(246,251,255,0.76)" fontSize="sm">Brillo garantizado</Text>
      </Box>
    </Box>
  );
}

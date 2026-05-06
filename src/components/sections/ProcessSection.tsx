import { Box, Card, CardBody, Container, Heading, Text, VStack, HStack, Image, IconButton } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { LandingData } from "./types";

type ProcessSectionProps = {
  processPinRef: React.RefObject<HTMLDivElement | null>;
  processTrackRef: React.RefObject<HTMLDivElement | null>;
  processSteps: LandingData["processSteps"];
};

export function ProcessSection({ processPinRef, processTrackRef, processSteps }: ProcessSectionProps) {
  // Comentando la escena GSAP pinneada original
  /*
  return (
    <Box id="proceso" data-nav-section ref={processPinRef} minH="100vh" overflow="hidden" py={{ base: 14, md: 20 }}>
      <Container maxW="container.xl" mb={8}>
        <Heading
          fontFamily="heading"
          fontWeight="400"
          lineHeight={{ base: 0.95, md: 0.9 }}
          letterSpacing="0.03em"
          fontSize={{ base: "2.7rem", md: "4.6rem", lg: "5.4rem" }}
          data-animate
        >
          <Box as="span" display="block">Proceso Urban</Box>
          <Box as="span" display="block" color="urban.300">Step-by-Step</Box>
        </Heading>
        <Text mt={4} color="rgba(246,251,255,0.76)" maxW="2xl" data-animate>
          Escena GSAP pinneada: haz scroll para recorrer cada etapa del servicio en horizontal.
        </Text>
      </Container>
      <Box ref={processTrackRef} display="flex" gap={{ base: 5, md: 7 }} px={{ base: 4, md: 10 }} w="max-content">
        {processSteps.map((step) => (
          <Card
            key={step.step}
            className="process-card"
            minW={{ base: "82vw", md: "540px" }}
            h={{ base: "280px", md: "340px" }}
            bg="linear-gradient(150deg, rgba(15,28,55,0.8), rgba(9,16,30,0.7))"
            border="1px solid rgba(120,166,255,0.32)"
            borderRadius="2xl"
            boxShadow="0 20px 48px rgba(0,0,0,0.28)"
          >
            <CardBody>
              <VStack align="start" justify="space-between" h="full">
                <Text fontFamily="heading" fontSize={{ base: "4.3rem", md: "6rem" }} lineHeight={0.8} letterSpacing="0.05em" color="urban.300">0{step.step}</Text>
                <Box>
                  <Heading fontSize={{ base: "xl", md: "3xl" }} mb={3}>{step.title}</Heading>
                  <Text color="rgba(246,251,255,0.77)">{step.desc}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Box>
    </Box>
  );
  */

  const [currentIndex, setCurrentIndex] = useState(0);

  // Mapeamos 6 imágenes para los 6 pasos
  const stepImages = [
    "/img/gallery/photo-1520430715151-3f9ee314b87a.avif",
    "/img/gallery/lave-motocicleta-tunel-lavado-pistola-agua-alta-presion_55997-2025.avif",
    "/img/gallery/lave-moto-taller-lavado-autos_55997-2137.avif",
    "/img/gallery/limpieza-moto-taller-lavado-autos_55997-2138.avif",
    "/img/gallery/vista-angulo-superior-motociclista-recortado-pulir-tuberia-su-motocicleta_1098-19056.avif",
    "/img/gallery/motociclistas-usan-panos-microfibra-amarillos-limpiar-venta-al-menor-motocicletas_330609-2187.avif",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processSteps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [processSteps.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % processSteps.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + processSteps.length) % processSteps.length);

  // Nos aseguramos de mantener las props por la interfaz (ProcessSectionProps) pero no las conectamos al DOM
  // para que GSAP en Landing.tsx no intente pinear el nuevo carrusel fallando la experiencia.
  
  return (
    <Box id="proceso" data-nav-section minH="90vh" py={{ base: 14, md: 20 }} display="flex" flexDir="column" justifyContent="center">

      <Container maxW="container.xl" mb={12}>
        <Heading
          fontFamily="heading"
          fontWeight="400"
          lineHeight={{ base: 0.95, md: 0.9 }}
          letterSpacing="0.03em"
          fontSize={{ base: "2.7rem", md: "4.6rem", lg: "5.4rem" }}
          data-animate
          textAlign="center"
        >
          <Box as="span" display="block">Proceso Urban</Box>
          <Box as="span" display="block" color="urban.500">Step-by-Step</Box>
        </Heading>
        <Text mt={4} color="rgba(246,251,255,0.76)" maxW="2xl" mx="auto" textAlign="center" data-animate>
          Descubre el cuidado perfecto y meticuloso que tu moto merece en cada lavado.
        </Text>
      </Container>

      <Container maxW="container.lg" position="relative">
        <Box 
          borderRadius="2xl" 
          overflow="hidden" 
          position="relative" 
          h={{ base: "400px", md: "500px" }}
          boxShadow="0 25px 50px rgba(0,0,0,0.5)"
          bg="urban.900"
        >
          {processSteps.map((step, idx) => (
            <Box
              key={step.step}
              position="absolute"
              top={0}
              left={0}
              w="full"
              h="full"
              opacity={idx === currentIndex ? 1 : 0}
              visibility={idx === currentIndex ? "visible" : "hidden"}
              transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              transform={idx === currentIndex ? "scale(1)" : "scale(1.05)"}
            >
              <Box position="absolute" inset={0} bg="blackAlpha.600" zIndex={1} />
              <Image 
                src={stepImages[idx] || stepImages[0]} 
                alt={step.title} 
                objectFit="cover" 
                w="full" 
                h="full" 
              />
              <VStack 
                position="absolute" 
                bottom={0} 
                left={0} 
                w="full" 
                p={{ base: 6, md: 12 }} 
                zIndex={2}
                align="flex-start"
                bg="linear-gradient(to top, rgba(5,10,20,0.95) 0%, rgba(5,10,20,0) 100%)"
              >
                <Text fontFamily="heading" fontSize={{ base: "3rem", md: "5rem" }} lineHeight={0.8} color="urban.500" mb={2}>
                  0{step.step}
                </Text>
                <Heading fontSize={{ base: "2xl", md: "4xl" }} color="white" mb={2}>{step.title}</Heading>
                <Text color="rgba(246,251,255,0.85)" fontSize={{ base: "md", md: "xl" }} maxW="3xl">
                  {step.desc}
                </Text>
              </VStack>
            </Box>
          ))}
        </Box>

        <IconButton
          aria-label="Anterior paso"
          icon={<FaChevronLeft />}
          position="absolute"
          left={{ base: 2, md: -12 }}
          top="50%"
          transform="translateY(-50%)"
          bg="urban.500"
          color="urban.950"
          _hover={{ bg: "urban.400", transform: "translateY(-50%) scale(1.1)" }}
          borderRadius="full"
          zIndex={3}
          onClick={prevSlide}
          boxShadow="0 4px 12px rgba(0,0,0,0.3)"
        />
        <IconButton
          aria-label="Siguiente paso"
          icon={<FaChevronRight />}
          position="absolute"
          right={{ base: 2, md: -12 }}
          top="50%"
          transform="translateY(-50%)"
          bg="urban.500"
          color="urban.950"
          _hover={{ bg: "urban.400", transform: "translateY(-50%) scale(1.1)" }}
          borderRadius="full"
          zIndex={3}
          onClick={nextSlide}
          boxShadow="0 4px 12px rgba(0,0,0,0.3)"
        />

        <HStack justify="center" mt={6} spacing={3}>
          {processSteps.map((_, idx) => (
            <Box
              key={idx}
              w={idx === currentIndex ? "32px" : "8px"}
              h="8px"
              bg={idx === currentIndex ? "urban.500" : "rgba(255,255,255,0.2)"}
              borderRadius="full"
              transition="all 0.3s ease"
              cursor="pointer"
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </HStack>
      </Container>
    </Box>
  );
}

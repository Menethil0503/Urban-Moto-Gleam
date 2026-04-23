import { Box, Card, CardBody, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { LandingData } from "./types";

type ProcessSectionProps = {
  processPinRef: React.RefObject<HTMLDivElement | null>;
  processTrackRef: React.RefObject<HTMLDivElement | null>;
  processSteps: LandingData["processSteps"];
};

export function ProcessSection({ processPinRef, processTrackRef, processSteps }: ProcessSectionProps) {
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
}

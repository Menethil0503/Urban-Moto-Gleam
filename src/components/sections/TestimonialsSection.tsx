import { Box, Card, CardBody, Container, HStack, Text, VStack } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { SectionTitle } from "./SectionTitle";
import { TestimonialItem } from "./types";

type TestimonialsSectionProps = {
  testimonialsSectionRef: React.RefObject<HTMLDivElement | null>;
  testimonialTrackRef: React.RefObject<HTMLDivElement | null>;
  testimonials: TestimonialItem[];
};

export function TestimonialsSection({ testimonialsSectionRef, testimonialTrackRef, testimonials }: TestimonialsSectionProps) {
  return (
    <Box ref={testimonialsSectionRef} py={{ base: 14, md: 24 }} overflow="hidden">
      <Container maxW="container.xl">
        <SectionTitle>Testimonios reales</SectionTitle>
      </Container>
      <Box overflow="hidden" position="relative" w="full">
        <HStack className="testimonials-track" ref={testimonialTrackRef} spacing={6} py={6} px={{ base: 4, md: 10 }} w="max-content">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <Card
              key={`${testimonial.name}-${index}`}
              minW={{ base: "300px", md: "420px", xl: "460px" }}
              bg="linear-gradient(145deg, rgba(15,28,55,0.8), rgba(9,15,30,0.72))"
              border="1px solid rgba(120,166,255,0.3)"
              borderRadius="2xl"
              boxShadow="0 18px 42px rgba(0,0,0,0.3)"
            >
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                      <FaStar key={`${testimonial.name}-star-${starIndex}`} color="#00BFFF" />
                    ))}
                  </HStack>
                  <Text fontStyle="italic" color="rgba(246,251,255,0.88)">“{testimonial.text}”</Text>
                  <Text fontWeight="700" color="urban.500">{testimonial.name}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}

import { Box, FormControl, FormLabel, Grid, HStack, Input, Text, Textarea, VStack, Container } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { LandingData } from "./types";

type ContactSectionProps = {
  contactSectionRef: React.RefObject<HTMLDivElement | null>;
  company: LandingData["company"];
  cta: ReactNode;
};

export function ContactSection({ contactSectionRef, company, cta }: ContactSectionProps) {
  return (
    <Container id="contacto" ref={contactSectionRef} data-nav-section maxW="container.xl" py={{ base: 16, md: 24 }}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="start">
        <Box className="contact-reveal" data-animate>
          <Text as="h2" fontFamily="heading" fontSize={{ base: "3rem", md: "5.8rem" }} lineHeight={0.9} fontWeight="400" letterSpacing="0.03em" mb={4}>Hablemos de tu moto</Text>
          <Text color="rgba(246,251,255,0.78)" mb={7}>{company.description}</Text>
          <VStack align="start" spacing={3}>
            <HStack><FaMapMarkerAlt color="#00BFFF" /><Text>{company.location}</Text></HStack>
            <HStack><FaWhatsapp color="#00BFFF" /><Text>{company.whatsapp}</Text></HStack>
            <HStack><MdEmail color="#00BFFF" /><Text>{company.email}</Text></HStack>
            <HStack><FaPhoneAlt color="#00BFFF" /><Text>{company.phone}</Text></HStack>
            <Text color="rgba(246,251,255,0.68)">Horario: {company.hours}</Text>
          </VStack>
        </Box>

        <Box
          className="section-glass contact-reveal"
          borderRadius="2xl"
          p={{ base: 5, md: 7 }}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input aria-label="Nombre" placeholder="Tu nombre" borderColor="rgba(120,166,255,0.3)" _placeholder={{ color: "rgba(246,251,255,0.5)" }} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input aria-label="Email" type="email" placeholder="tucorreo@email.com" borderColor="rgba(120,166,255,0.3)" _placeholder={{ color: "rgba(246,251,255,0.5)" }} />
            </FormControl>
            <FormControl>
              <FormLabel>Mensaje</FormLabel>
              <Textarea aria-label="Mensaje" placeholder="Cuéntanos qué necesita tu moto" minH="120px" borderColor="rgba(120,166,255,0.3)" _placeholder={{ color: "rgba(246,251,255,0.5)" }} />
            </FormControl>
            {cta}
          </VStack>
        </Box>
      </Grid>

      <Box mt={8} className="contact-reveal section-glass" borderRadius="2xl" overflow="hidden" data-animate>
        <iframe
          title="Mapa Urban Moto Gleam Bogotá"
          src="https://maps.google.com/maps?q=bogota%20colombia&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="320"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Box>
    </Container>
  );
}

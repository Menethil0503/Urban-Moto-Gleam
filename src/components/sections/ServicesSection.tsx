import { Box, Card, CardBody, Container, Grid, Heading, List, ListIcon, ListItem, SimpleGrid, Stack, Text, VStack, chakra, Icon, Center } from "@chakra-ui/react";
import { FaCheckCircle, FaShower, FaShieldAlt, FaStar, FaCog, FaMotorcycle, FaGem } from "react-icons/fa";
import { LandingData } from "./types";

type ServicesSectionProps = {
  servicesGridRef: React.RefObject<HTMLDivElement | null>;
  packages: LandingData["packages"];
  benefits: LandingData["benefits"];
  company: LandingData["company"];
};

const getPackageIcon = (iconName: string) => {
  if (iconName.includes("basic")) return FaShower;
  if (iconName.includes("premium")) return FaShieldAlt;
  if (iconName.includes("detailing")) return FaGem;
  if (iconName.includes("motor")) return FaCog;
  return FaMotorcycle;
};

export function ServicesSection({ servicesGridRef, packages, benefits, company }: ServicesSectionProps) {
  return (
    <>
      <Container id="servicios" data-nav-section maxW="container.xl" py={{ base: 16, md: 24 }}>
        <Stack spacing={8}>
          <Heading fontFamily="heading" fontWeight="400" letterSpacing="0.03em" lineHeight={0.9} fontSize={{ base: "3.2rem", md: "6.2rem" }} data-animate>
            Paquetes premium para cada tipo de rider
          </Heading>
          <Text color="rgba(246,251,255,0.76)" maxW="3xl" data-animate>
            Selecciona el nivel de cuidado ideal para tu moto. Todos nuestros paquetes incluyen procesos ecológicos y acabados premium.
          </Text>
          <SimpleGrid
            ref={servicesGridRef}
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
          >
            {packages.map((pkg, index) => (
              <Card
                key={pkg.title}
                className="package-card"
                bg="linear-gradient(160deg, rgba(17,30,57,0.78), rgba(10,16,31,0.66))"
                border="1px solid rgba(120,166,255,0.28)"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 18px 44px rgba(0,0,0,0.28)"
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Text
                      color="urban.300"
                      fontFamily="heading"
                      letterSpacing="0.12em"
                      lineHeight={0.9}
                      fontSize="2.3rem"
                    >
                      0{index + 1}
                    </Text>
                    <Center
                      className="package-icon"
                      h="72px"
                      w="72px"
                      borderRadius="xl"
                      bg="rgba(87,182,255,0.12)"
                      style={{ filter: "drop-shadow(0 0 12px rgba(0,191,255,0.25))" }}
                      border="1px solid rgba(0,191,255,0.2)"
                    >
                      <Icon as={getPackageIcon(pkg.icon)} boxSize="36px" color="urban.400" />
                    </Center>
                    <Heading fontSize="2xl" lineHeight={1.05}>{pkg.title}</Heading>
                    <Text color="rgba(246,251,255,0.77)">{pkg.description}</Text>
                    <Text color="rgba(246,251,255,0.7)">Duración: {pkg.duration}</Text>
                    <List spacing={1}>
                      {pkg.features.slice(0, 3).map((feature) => (
                        <ListItem key={`${pkg.title}-${feature}`} fontSize="sm" color="rgba(246,251,255,0.74)">
                          <ListIcon as={FaCheckCircle} color="urban.500" />
                          {feature}
                        </ListItem>
                      ))}
                    </List>
                    <Text fontWeight="700" color="urban.500" fontSize="lg">{pkg.price}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Container maxW="container.xl" py={{ base: 8, md: 14 }}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="stretch">
          <Box className="section-glass" borderRadius="2xl" p={{ base: 5, md: 8 }} data-animate>
            <Heading fontSize={{ base: "xl", md: "3xl" }} mb={4}>¿Por qué Urban Moto Gleam?</Heading>
            <List spacing={3}>
              {benefits.map((benefit) => (
                <ListItem key={benefit} color="rgba(246,251,255,0.82)">
                  <ListIcon as={FaCheckCircle} color="urban.500" />
                  {benefit}
                </ListItem>
              ))}
            </List>
          </Box>
          <Box className="section-glass" borderRadius="2xl" p={{ base: 5, md: 8 }} data-animate>
            <Heading fontSize={{ base: "xl", md: "3xl" }} mb={4}>Nuestra misión</Heading>
            <Text color="rgba(246,251,255,0.82)" mb={4}>{company.mission}</Text>
            <Heading fontSize={{ base: "lg", md: "2xl" }} mb={2}>Visión</Heading>
            <Text color="rgba(246,251,255,0.72)" mb={4}>{company.vision}</Text>
            <Heading fontSize={{ base: "lg", md: "2xl" }} mb={2}>Certificaciones</Heading>
            <VStack align="start" spacing={1}>
              {company.certifications.map((cert) => (
                <Text key={cert} color="rgba(246,251,255,0.72)">• {cert}</Text>
              ))}
            </VStack>
          </Box>
        </Grid>
      </Container>
    </>
  );
}

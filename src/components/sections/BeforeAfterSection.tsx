import { Box, Container, Grid, Heading, HStack, Text } from "@chakra-ui/react";

type BeforeAfterSectionProps = {
  beforeAfterSectionRef: React.RefObject<HTMLDivElement | null>;
  sliderRef: React.RefObject<HTMLDivElement | null>;
  afterLayerRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  beforeImage: string;
  afterImage: string;
};

export function BeforeAfterSection({ beforeAfterSectionRef, sliderRef, afterLayerRef, handleRef, beforeImage, afterImage }: BeforeAfterSectionProps) {
  return (
    <Container maxW="container.xl" py={{ base: 10, md: 20 }}>
      <Grid id="antes-despues" ref={beforeAfterSectionRef} templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }} gap={8} alignItems="center">
        <Box data-animate>
          <Heading fontFamily="heading" fontWeight="400" letterSpacing="0.03em" lineHeight={0.9} fontSize={{ base: "3rem", md: "5.8rem" }} mb={4}>
            Antes / Después con control táctil
          </Heading>
          <Text color="rgba(246,251,255,0.78)" maxW="xl" mb={6}>
            Desliza para comparar una moto con suciedad urbana versus el resultado premium de Urban Moto Gleam.
          </Text>
        </Box>
        <Box ref={sliderRef} position="relative" h={{ base: "290px", md: "430px" }} borderRadius="2xl" border="1px solid rgba(120,166,255,0.3)" bg="linear-gradient(145deg, rgba(15,26,49,0.75), rgba(7,12,24,0.72))" p={1.5} overflow="hidden" data-animate>
          <Box position="absolute" inset={0} bgImage={`url(${beforeImage})`} bgPos="center" bgSize="cover" />
          <Box ref={afterLayerRef} position="absolute" inset={0} bgImage={`url(${afterImage})`} bgPos="center" bgSize="cover" clipPath="inset(0 45% 0 0)" />
          <Box
            ref={handleRef}
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            w="4px"
            bg="urban.500"
            cursor="ew-resize"
            boxShadow="0 0 22px rgba(29,214,193,0.6)"
            _before={{
              content: '"↔"',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              w: "48px",
              h: "48px",
              borderRadius: "full",
              bg: "urban.500",
              color: "urban.950",
              display: "grid",
              placeItems: "center",
              fontWeight: "800",
              fontSize: "lg",
              border: "1px solid rgba(255,255,255,0.26)",
            }}
          />
          <HStack position="absolute" bottom={4} left={4} spacing={3}>
            <Text bg="rgba(4,8,17,0.75)" border="1px solid rgba(120,166,255,0.22)" px={3} py={1} borderRadius="full">Antes</Text>
            <Text bg="rgba(29,214,193,0.85)" color="urban.950" px={3} py={1} borderRadius="full" fontWeight="700">Después</Text>
          </HStack>
        </Box>
      </Grid>
    </Container>
  );
}

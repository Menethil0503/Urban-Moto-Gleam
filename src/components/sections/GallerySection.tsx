import { Box, Container, Heading, SimpleGrid, chakra } from "@chakra-ui/react";

type GallerySectionProps = {
  gallerySectionRef: React.RefObject<HTMLDivElement | null>;
  images: string[];
};

export function GallerySection({
  gallerySectionRef,
  images,
}: GallerySectionProps) {
  return (
    <Container
      ref={gallerySectionRef}
      id="galeria"
      data-nav-section
      maxW="container.xl"
      py={{ base: 12, md: 20 }}
    >
      <Heading
        fontFamily="heading"
        fontWeight="400"
        letterSpacing="0.03em"
        lineHeight={0.9}
        fontSize={{ base: "3.1rem", md: "6rem" }}
        mb={{ base: 8, md: 12 }}
        data-animate
      >
        Gallery urbana
      </Heading>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={{ base: 5, md: 6 }}
      >
        {images.map((imageUrl, index) => (
          <Box
            key={`${imageUrl}-${index}`}
            className="gallery-item"
            borderRadius="2xl"
            overflow="hidden"
            border="1px solid rgba(120,166,255,0.32)"
            boxShadow="0 18px 38px rgba(0,0,0,0.28)"
            bg="linear-gradient(145deg, rgba(15,27,52,0.78), rgba(9,15,29,0.7))"
            p={1.5}
            h={{
              base: "240px",
              md: index % 3 === 1 ? "290px" : "330px",
              lg: index % 3 === 1 ? "280px" : "340px",
            }}
          >
            <chakra.img
              src={imageUrl}
              alt={`Galería Urban Moto Gleam ${index + 1}`}
              w="full"
              h="full"
              borderRadius="xl"
              objectFit="cover"
              loading="lazy"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}

import { Box, Container, Flex, HStack, IconButton, Link, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FaInstagram } from "react-icons/fa";
import { LandingData } from "./types";

type FooterSectionProps = {
  company: LandingData["company"];
  socialIcons: Record<string, IconType>;
};

export function FooterSection({ company, socialIcons }: FooterSectionProps) {
  return (
    <Box as="footer" borderTop="1px solid rgba(120,166,255,0.26)" py={10}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
          <Text color="rgba(246,251,255,0.72)">© {new Date().getFullYear()} {company.name}. Todos los derechos reservados.</Text>
          <HStack spacing={3}>
            {company.social.map((social) => {
              const Icon = socialIcons[social.name] ?? FaInstagram;
              return (
                <IconButton
                  key={social.name}
                  as={Link}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  icon={<Icon />}
                  variant="outline"
                  borderColor="rgba(120,166,255,0.28)"
                  color="urban.100"
                  _hover={{ bg: "rgba(29,214,193,0.18)", borderColor: "urban.500", transform: "translateY(-3px)" }}
                />
              );
            })}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

import { Box, Button, Flex, HStack, Text, Icon } from "@chakra-ui/react";
import { FaMotorcycle } from "react-icons/fa";
import { ReactNode } from "react";
import { NavItem } from "./types";

type HeaderSectionProps = {
  headerRef: React.RefObject<HTMLDivElement | null>;
  logoRef: React.RefObject<HTMLDivElement | null>;
  navItems: NavItem[];
  onNavigate: (id: string) => void;
  cta: ReactNode;
};

export function HeaderSection({ headerRef, logoRef, navItems, onNavigate, cta }: HeaderSectionProps) {
  return (
    <Box
      as="header"
      ref={headerRef}
      position="fixed"
      top={3}
      left={0}
      right={0}
      px={{ base: 2, md: 4, lg: 6 }}
      zIndex={40}
      display="flex"
      justifyContent="center"
    >
      <Flex
        align="center"
        justify="space-between"
        gap={4}
        w="full"
        maxW="container.xl"
        bg="linear-gradient(140deg, rgba(8,16,31,0.82), rgba(11,21,40,0.62))"
        border="1px solid rgba(120,166,255,0.3)"
        backdropFilter="blur(14px)"
        borderRadius="full"
        px={{ base: 4, md: 6 }}
        py={{ base: 2, md: 2.5 }}
        boxShadow="0 14px 44px rgba(3,6,12,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
      >
        <HStack ref={logoRef} cursor="pointer" onClick={() => onNavigate("home")} aria-label="Ir al inicio Urban Moto Gleam" spacing={2} flexShrink={0}>
          <Icon as={FaMotorcycle} w={8} h={8} color="urban.500" />
          <Text 
            fontFamily="heading" 
            fontWeight="bold" 
            fontSize={{ base: "lg", md: "xl" }} 
            color="white" 
            letterSpacing="0.05em"
            lineHeight="1"
          >
            URBAN MOTO
            <Text as="span" display="block" color="urban.500" fontSize="xs" fontWeight="500" letterSpacing="0.15em">
              GLEAM
            </Text>
          </Text>
        </HStack>

        <HStack spacing={1.5} bg="rgba(87,182,255,0.07)" border="1px solid rgba(120,166,255,0.22)" borderRadius="full" px={1.5} py={1.5} display={{ base: "none", md: "flex" }} flexShrink={0}>
          {navItems.map((item) => (
            <Button
              key={item.id}
              data-nav-item={item.id}
              variant="ghost"
              color="urban.100"
              size="sm"
              onClick={() => onNavigate(item.id)}
              _hover={{ bg: "rgba(29,214,193,0.16)", color: "urban.500" }}
              borderRadius={"full"}
              textTransform="uppercase"
              letterSpacing="0.05em"
              fontSize="0.76rem"
              px={4}
              aria-label={`Ir a ${item.label}`}
            >
              {item.label}
            </Button>
          ))}
        </HStack>

        <Box flexShrink={0}>{cta}</Box>
      </Flex>
    </Box>
  );
}

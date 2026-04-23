import { Box, Container, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { SectionTitle } from "./SectionTitle";

type PackageRow = {
  package: string;
  features: string[];
  price: string;
};

type PricingSectionProps = {
  pricingTableRef: React.RefObject<HTMLDivElement | null>;
  packageRows: PackageRow[];
};

export function PricingSection({ pricingTableRef, packageRows }: PricingSectionProps) {
  return (
    <Container id="precios" maxW="container.xl" py={{ base: 16, md: 24 }}>
      <SectionTitle>Tabla de paquetes y precios</SectionTitle>
      <Box ref={pricingTableRef} className="section-glass" borderRadius="2xl" p={{ base: 2, md: 5 }} overflowX="auto" data-animate>
        <Table variant="simple" colorScheme="cyan" size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th color="urban.300">Paquete</Th>
              <Th color="urban.300">Incluye</Th>
              <Th color="urban.300">Precio</Th>
            </Tr>
          </Thead>
          <Tbody>
            {packageRows.map((item) => (
              <Tr key={item.package}>
                <Td fontWeight="700">{item.package}</Td>
                <Td>{item.features.join(" · ")}</Td>
                <Td color="urban.500" fontWeight="700">{item.price}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
}

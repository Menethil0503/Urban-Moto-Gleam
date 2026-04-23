import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Container } from "@chakra-ui/react";
import { SectionTitle } from "./SectionTitle";
import { FaqItem } from "./types";

type FaqSectionProps = {
  faqSectionRef: React.RefObject<HTMLDivElement | null>;
  faq: FaqItem[];
};

export function FaqSection({ faqSectionRef, faq }: FaqSectionProps) {
  return (
    <Container id="faq" ref={faqSectionRef} maxW="container.xl" py={{ base: 10, md: 18 }}>
      <SectionTitle>Preguntas frecuentes</SectionTitle>
      <Accordion allowToggle className="section-glass" borderRadius="2xl" px={{ base: 3, md: 6 }}>
        {faq.map((item) => (
          <AccordionItem key={item.question} borderColor="rgba(120,166,255,0.24)">
            <h3>
              <AccordionButton py={5}>
                <Box as="span" flex="1" textAlign="left" fontWeight="700">{item.question}</Box>
                <AccordionIcon color="urban.500" />
              </AccordionButton>
            </h3>
            <AccordionPanel color="rgba(246,251,255,0.75)">{item.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}

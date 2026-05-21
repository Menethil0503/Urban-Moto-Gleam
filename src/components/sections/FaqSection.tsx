import { Box, Container, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { SectionTitle } from "./SectionTitle";
import { LandingData } from "./types";
import { FaqChatbot } from "./FaqChatbot";

type FaqSectionProps = {
  faqSectionRef: React.RefObject<HTMLDivElement | null>;
  data?: LandingData;
};

export function FaqSection({ faqSectionRef, data: landingData }: FaqSectionProps) {
  return (
    <>
      <Container id="faq" ref={faqSectionRef} maxW="container.xl" py={{ base: 10, md: 18 }}>
        <SectionTitle>Preguntas frecuentes</SectionTitle>
        <Accordion allowToggle className="section-glass" borderRadius="2xl" px={{ base: 3, md: 6 }}>
          {landingData?.faq?.map((item) => (
            <AccordionItem key={item.question} borderColor="rgba(120,166,255,0.24)">
              <h2>
                <AccordionButton py={5}>
                  <Box as="span" flex="1" textAlign="left" fontWeight="700">{item.question}</Box>
                  <AccordionIcon color="urban.500" />
                </AccordionButton>
              </h2>
              <AccordionPanel color="rgba(246,251,255,0.75)" pb={4}>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
      <FaqChatbot data={landingData} />
    </>
  );
}

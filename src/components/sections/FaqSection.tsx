import { Box, Container, Input, Button, VStack, HStack, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { SectionTitle } from "./SectionTitle";
import { LandingData, PackageItem, FaqItem } from "./types";
import { FaRobot, FaPaperPlane, FaCommentDots, FaTimes } from "react-icons/fa";

type FaqSectionProps = {
  faqSectionRef: React.RefObject<HTMLDivElement | null>;
  data?: LandingData;
};

export function FaqSection({ faqSectionRef, data: landingData }: FaqSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: "user" | "bot", text: string}[]>([
    { role: "bot", text: "¡Hola! Soy tu asesor de Urban Moto Gleam. ¿En qué te puedo ayudar sobre nuestros servicios de lavado hoy?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const inputLower = userMessage.toLowerCase();
      let botResponse = "";

      if (inputLower.includes("precio") || inputLower.includes("paquete") || inputLower.includes("vale") || inputLower.includes("cuánto") || inputLower.includes("cuanto") || inputLower.includes("costo")) {
        const packagesStr = landingData?.packages?.map(p => `${p.title}: ${p.price}`).join(" | ") || "";
        botResponse = `Nuestros paquetes y precios son: ${packagesStr}. Puedes ver más detalles en la sección de Servicios de la web.`;
      } else if (inputLower.includes("hora") || inputLower.includes("abren") || inputLower.includes("cierran")) {
        botResponse = `Nuestro horario de atención es: ${landingData?.company?.hours || "Lunes a Sábado: 8:00 AM - 7:00 PM | Domingos: 9:00 AM - 4:00 PM"}.`;
      } else if (inputLower.includes("ubicación") || inputLower.includes("ubicacion") || inputLower.includes("donde") || inputLower.includes("dirección") || inputLower.includes("direccion") || inputLower.includes("dónde")) {
        botResponse = `Estamos ubicados en: ${landingData?.company?.location || "Calle 100 #15-20, Bogotá, Colombia"}.`;
      } else if (inputLower.includes("cita") || inputLower.includes("agendar") || inputLower.includes("reserva")) {
        botResponse = `¡Claro! Puedes agendar tu cita usando el botón 'Reserva tu Cita' en la página, o enviándonos un mensaje al WhatsApp: ${landingData?.company?.whatsapp || "oficial"}.`;
      } else if (inputLower.includes("hola") || inputLower.includes("buenas") || inputLower.includes("saludos") || inputLower.includes("dia") || inputLower.includes("tarde")) {
        botResponse = "¡Hola! ¿En qué te puedo ayudar hoy? Puedes preguntarme sobre nuestros precios, horarios, ubicación o cómo agendar una cita.";
      } else if (inputLower.includes("gracias") || inputLower.includes("ok") || inputLower.includes("vale") || inputLower.includes("listo")) {
        botResponse = "¡Con mucho gusto! Aquí estoy si necesitas algo más para consentir tu moto.";
      } else {
        botResponse = "Soy un asistente automatizado y no estoy seguro de cómo responder a eso. Intenta preguntarme sobre precios, agendar una cita, nuestros horarios o ubicación.";
      }

      // Simulamos un tiempo de respuesta de escritura
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text: botResponse }]);
        setIsLoading(false);
      }, 800);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "bot", text: "Error de conexión." }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container id="faq" ref={faqSectionRef} maxW="container.xl" py={{ base: 10, md: 18 }}>
        <SectionTitle>Preguntas frecuentes</SectionTitle>
        <Accordion allowToggle className="section-glass" borderRadius="2xl" px={{ base: 3, md: 6 }}>
          {landingData?.faq?.map((item: FaqItem) => (
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

      {/* Botón flotante para abrir/cerrar el Chatbot */}
      <Box
        position="fixed"
        bottom={{ base: "20px", md: "30px" }}
        right={{ base: "20px", md: "30px" }}
        zIndex={9999}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          bg="urban.500"
          color="urban.950"
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="0 4px 20px rgba(0, 191, 255, 0.4)"
          p={0}
          _hover={{ bg: "urban.400", transform: "scale(1.05)" }}
          _active={{ transform: "scale(0.95)" }}
          transition="all 0.2s"
        >
          {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={28} />}
        </Button>
      </Box>

      {/* Ventana de Chatbot Flotante */}
      {isOpen && (
        <Box
          position="fixed"
          bottom={{ base: "90px", md: "100px" }}
          right={{ base: "10px", md: "30px" }}
          w={{ base: "calc(100vw - 20px)", sm: "380px" }}
          h="500px"
          maxH="calc(100vh - 120px)"
          zIndex={9999}
          className="section-glass"
          borderRadius="2xl"
          display="flex"
          flexDir="column"
          boxShadow="0 10px 40px rgba(0,0,0,0.5)"
          overflow="hidden"
          border="1px solid rgba(120, 166, 255, 0.2)"
          bg="rgba(10, 15, 30, 0.95)"
          backdropFilter="blur(16px)"
        >
          {/* Header del Chatbot */}
          <HStack bg="rgba(0, 0, 0, 0.3)" p={4} justifyContent="space-between" borderBottom="1px solid rgba(120,166,255,0.2)">
            <HStack>
              <Box color="urban.500"><FaRobot size={22} /></Box>
              <Text fontWeight="bold" color="white" fontSize="md">Bob el Bicker</Text>
            </HStack>
            <Button 
              size="sm" 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }} 
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </Button>
          </HStack>

          {/* Área de Mensajes */}
          <VStack flex="1" overflowY="auto" spacing={4} p={4} pb={2} align="stretch" sx={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(0,191,255,0.3)', borderRadius: '10px' },
            }}>
            {messages.map((m, idx) => (
              <HStack key={idx} alignSelf={m.role === "user" ? "flex-end" : "flex-start"} maxW="85%">
                {m.role === "bot" && <Box color="urban.500" mt={1}><FaRobot size={18} /></Box>}
                <Box 
                  bg={m.role === "user" ? "urban.500" : "rgba(25, 45, 75, 0.8)"} 
                  color={m.role === "user" ? "urban.950" : "white"}
                  px={4} py={3} borderRadius="2xl"
                  borderBottomRightRadius={m.role === "user" ? "sm" : "2xl"}
                  borderBottomLeftRadius={m.role === "bot" ? "sm" : "2xl"}
                  boxShadow="0 4px 10px rgba(0,0,0,0.15)"
                >
                  <Text fontSize="sm" fontWeight={m.role === "user" ? "600" : "400"}>{m.text}</Text>
                </Box>
              </HStack>
            ))}
            {isLoading && (
              <HStack maxW="85%" alignSelf="flex-start">
                <Box color="urban.500" mt={1}><FaRobot size={18} /></Box>
                <Box bg="rgba(25, 45, 75, 0.8)" px={4} py={3} borderRadius="2xl" borderBottomLeftRadius="sm">
                  <Text fontSize="sm" color="white" className="loading-dots">...</Text>
                </Box>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
          
          {/* Input de Mensaje */}
          <HStack p={4} borderTop="1px solid rgba(120,166,255,0.2)" bg="rgba(0, 0, 0, 0.2)">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe aquí tu pregunta..."
              bg="rgba(10, 15, 30, 0.6)"
              border="1px solid rgba(120,166,255,0.1)"
              color="white"
              fontSize="sm"
              _focus={{ boxShadow: "0 0 0 1px #00BFFF", bg: "rgba(10, 15, 30, 0.9)" }}
              borderRadius="full"
              autoFocus
            />
            <Button 
              onClick={handleSendMessage}
              isLoading={isLoading}
              bg="urban.500" 
              color="urban.950" 
              borderRadius="full" 
              w="44px" h="40px"
              p={0}
              _hover={{ bg: "urban.400" }}
            >
              <FaPaperPlane size={16} />
            </Button>
          </HStack>
        </Box>
      )}
    </>
  );
}

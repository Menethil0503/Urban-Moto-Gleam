import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  useToast,
  IconButton
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { PackageItem } from "./types";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageItem[];
};

export function BookingModal({ isOpen, onClose, packages }: BookingModalProps) {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate some dummy occupied days when the month changes
  const occupiedDays = useMemo(() => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const randomOccupied = [];
    for (let i = 0; i < 8; i++) {
        randomOccupied.push(Math.floor(Math.random() * daysInMonth) + 1);
    }
    return randomOccupied;
  }, [currentMonth]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast({
        title: "Selecciona una fecha",
        description: "Debes elegir un día disponible en el calendario.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onClose();
    toast({
      title: "Cita agendada con éxito.",
      description: "Te contactaremos para confirmar tu cita. ¡Gracias por preferir a Urban Moto Gleam!",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Weekday headers
    weekDays.forEach((day, idx) => {
      days.push(
        <Box key={`header-${idx}`} textAlign="center" fontSize="xs" fontWeight="bold" color="urban.300" mb={2}>
          {day}
        </Box>
      );
    });

    // Empty slots before 1st day
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} />);
    }

    // Days slots
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isOccupied = occupiedDays.includes(day);
      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
      const disabled = isPast || isOccupied;

      days.push(
        <Box
          key={day}
          textAlign="center"
          py={2}
          bg={isSelected ? "urban.500" : (disabled ? "transparent" : "rgba(255,255,255,0.05)")}
          color={isSelected ? "urban.950" : (disabled ? "whiteAlpha.300" : "white")}
          borderRadius="md"
          cursor={disabled ? "not-allowed" : "pointer"}
          _hover={!disabled && !isSelected ? { bg: "urban.400", color: "urban.950" } : undefined}
          transition="all 0.2s"
          onClick={() => !disabled && setSelectedDate(date)}
          position="relative"
        >
          {day}
          {isOccupied && !isPast && (
             <Box position="absolute" bottom="2px" left="50%" transform="translateX(-50%)" w="4px" h="4px" bg="red.400" borderRadius="full" />
          )}
        </Box>
      );
    }

    return (
      <Box bg="rgba(10, 15, 30, 0.4)" p={4} borderRadius="xl" border="1px solid rgba(0, 191, 255, 0.1)">
        <HStack justify="space-between" mb={4}>
          <IconButton aria-label="Mes anterior" icon={<FaChevronLeft />} size="sm" variant="ghost" color="urban.100" onClick={handlePrevMonth} />
          <Text fontWeight="600" color="white" textTransform="capitalize">
            {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </Text>
          <IconButton aria-label="Mes siguiente" icon={<FaChevronRight />} size="sm" variant="ghost" color="urban.100" onClick={handleNextMonth} />
        </HStack>
        <SimpleGrid columns={7} spacing={1}>
          {days}
        </SimpleGrid>
        <HStack mt={4} fontSize="xs" color="whiteAlpha.600" justify="center" spacing={4}>
          <HStack><Box w="8px" h="8px" bg="urban.500" borderRadius="full" /><Text>Seleccionado</Text></HStack>
          <HStack><Box w="8px" h="8px" bg="rgba(255,255,255,0.05)" borderRadius="full" /><Text>Disponible</Text></HStack>
          <HStack><Box w="8px" h="8px" bg="red.400" borderRadius="full" /><Text>Ocupado</Text></HStack>
        </HStack>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size="xl">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="urban.900" border="1px solid rgba(0, 191, 255, 0.3)" borderRadius="2xl" color="white" mx={4}>
        <ModalHeader color="urban.500" fontSize="2xl" textAlign="center" pt={8}>Reserva tu Cita</ModalHeader>
        <ModalCloseButton color="urban.100" />
        <ModalBody pb={6}>
          <form id="booking-form" onSubmit={handleBookingSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel color="urban.100" fontSize="sm">Nombre Completo</FormLabel>
                <Input onChange={(e) => e.target.value = e.target.value.replace(/[0-9]/g, '')} placeholder="Escribe tu nombre" _focus={{ borderColor: "urban.500", boxShadow: "none" }} borderRadius="xl" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="urban.100" fontSize="sm">Selecciona una Fecha</FormLabel>
                {renderCalendar()}
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="urban.100" fontSize="sm">Hora Disponible</FormLabel>
                  <Select placeholder="Selecciona una hora" _focus={{ borderColor: "urban.500", boxShadow: "none" }} borderRadius="xl" bg="rgba(10,15,30,0.4)">
                    <option value="08:00" style={{background: "#0f1c37"}}>08:00 AM</option>
                    <option value="09:00" style={{background: "#0f1c37"}}>09:00 AM</option>
                    <option value="10:00" style={{background: "#0f1c37"}}>10:00 AM</option>
                    <option value="11:00" style={{background: "#0f1c37"}}>11:00 AM</option>
                    <option value="13:00" style={{background: "#0f1c37"}}>01:00 PM</option>
                    <option value="14:00" style={{background: "#0f1c37"}}>02:00 PM</option>
                    <option value="15:00" style={{background: "#0f1c37"}}>03:00 PM</option>
                    <option value="16:00" style={{background: "#0f1c37"}}>04:00 PM</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="urban.100" fontSize="sm">Servicio / Paquete</FormLabel>
                  <Select placeholder="¿Qué servicio deseas?" _focus={{ borderColor: "urban.500", boxShadow: "none" }} borderRadius="xl" bg="rgba(10,15,30,0.4)">
                    {packages.map(pkg => (
                      <option key={pkg.title} value={pkg.title} style={{background: "#0f1c37"}}>{pkg.title}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter borderTop="1px solid rgba(0, 191, 255, 0.1)" bg="rgba(0, 191, 255, 0.02)" borderBottomRadius="2xl">
          <Button variant="ghost" mr={3} onClick={onClose} color="urban.100" _hover={{ bg: "whiteAlpha.200" }} borderRadius="full">
            Cancelar
          </Button>
          <Button form="booking-form" type="submit" bg="urban.500" color="urban.950" _hover={{ bg: "urban.400" }} borderRadius="full" px={8}>
            Confirmar Cita
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
"use client";

import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { ReservaJSON } from "@/src/lib/reservas-json";
import { HORAS_DISPONIBLES } from "@/src/lib/reservas";
import {
  CODIGOS_PAIS,
  CODIGO_PAIS_POR_DEFECTO,
  obtenerCodigoPais,
  unirCelular,
} from "@/src/lib/codigos-pais";
import { PackageItem } from "./types";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageItem[];
  selectedPackageTitle?: string;
};

type CamposFormulario = {
  nombre: string;
  cedula: string;
  celular: string;
  email: string;
  placa: string;
  marca: string;
  modelo: string;
  observaciones: string;
};

const FORMULARIO_VACIO: CamposFormulario = {
  nombre: "",
  cedula: "",
  celular: "",
  email: "",
  placa: "",
  marca: "",
  modelo: "",
  observaciones: "",
};

/** Las cédulas colombianas tienen como MÁXIMO 10 dígitos (las antiguas pueden tener menos). */
const CEDULA_LONGITUD_MAX = 10;

type ResultadoReserva = {
  reserva: ReservaJSON;
  whatsapp: { enviado: boolean; error?: string };
};

/** "2026-10" a partir de un Date. */
function claveMes(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-10-03" a partir de componentes locales. */
function claveDia(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function BookingModal({ isOpen, onClose, packages, selectedPackageTitle }: BookingModalProps) {
  const toast = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(selectedPackageTitle ?? "");
  const [formulario, setFormulario] = useState<CamposFormulario>(FORMULARIO_VACIO);
  const [codigoPais, setCodigoPais] = useState(CODIGO_PAIS_POR_DEFECTO);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoReserva | null>(null);

  // Validaciones que se muestran en vivo, sin esperar al envío.
  // La cédula solo se limita por arriba: hay cédulas antiguas con menos dígitos.
  const paisSeleccionado = obtenerCodigoPais(codigoPais);
  const celularIncompleto =
    formulario.celular.length > 0 && formulario.celular.length < paisSeleccionado.digitosLocal;

  // Disponibilidad real, leída de MongoDB a través de /api/disponibilidad.
  const [conteoPorDia, setConteoPorDia] = useState<Record<string, number>>({});
  const [diasCompletos, setDiasCompletos] = useState<string[]>([]);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [mesCargado, setMesCargado] = useState("");

  const mesActualClave = claveMes(currentMonth);
  const cargandoMes = isOpen && mesCargado !== mesActualClave;

  // Ocupación del mes visible.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelado = false;

    fetch(`/api/disponibilidad?mes=${mesActualClave}`, { cache: "no-store" })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject(new Error("disponibilidad"))))
      .then((datos) => {
        if (cancelado) return;
        setConteoPorDia(datos.conteoPorDia ?? {});
        setDiasCompletos(datos.diasCompletos ?? []);
        setMesCargado(mesActualClave);
      })
      .catch(() => {
        if (cancelado) return;
        setConteoPorDia({});
        setDiasCompletos([]);
        setMesCargado(mesActualClave);
      });

    return () => {
      cancelado = true;
    };
  }, [isOpen, mesActualClave]);

  // Bloques horarios ocupados del día elegido.
  useEffect(() => {
    if (!isOpen || !fechaSeleccionada) {
      return;
    }

    let cancelado = false;

    fetch(`/api/disponibilidad?fecha=${fechaSeleccionada}`, { cache: "no-store" })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject(new Error("horas"))))
      .then((datos) => {
        if (!cancelado) setHorasOcupadas(datos.horasOcupadas ?? []);
      })
      .catch(() => {
        if (!cancelado) setHorasOcupadas([]);
      });

    return () => {
      cancelado = true;
    };
  }, [isOpen, fechaSeleccionada]);

  const actualizarCampo = (campo: keyof CamposFormulario, valor: string) => {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  };

  const refrescarMes = async () => {
    const respuesta = await fetch(`/api/disponibilidad?mes=${mesActualClave}`, { cache: "no-store" });
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    setConteoPorDia(datos.conteoPorDia ?? {});
    setDiasCompletos(datos.diasCompletos ?? []);
  };

  const handleBookingSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (!formulario.cedula) {
      toast({
        title: "Falta tu cédula",
        description: "Escribe tu número de cédula para registrar la reserva.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (formulario.cedula.length > CEDULA_LONGITUD_MAX) {
      toast({
        title: "Revisa tu cédula",
        description: `La cédula admite máximo ${CEDULA_LONGITUD_MAX} dígitos y escribiste ${formulario.cedula.length}.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (formulario.celular.length < paisSeleccionado.digitosLocal) {
      toast({
        title: "Revisa tu celular",
        description: `Un número de ${paisSeleccionado.nombre} tiene ${paisSeleccionado.digitosLocal} dígitos y escribiste ${formulario.celular.length}.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!fechaSeleccionada) {
      toast({
        title: "Selecciona una fecha",
        description: "Debes elegir un día disponible en el calendario.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!horaSeleccionada) {
      toast({
        title: "Selecciona una hora",
        description: "Elige uno de los bloques horarios disponibles.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formulario,
          celular: unirCelular(codigoPais, formulario.celular),
          servicio: selectedPackage,
          fecha: fechaSeleccionada,
          hora: horaSeleccionada,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        toast({
          title: "No se pudo agendar la cita",
          description: datos.error ?? "Inténtalo de nuevo en unos minutos.",
          status: "error",
          duration: 6000,
          isClosable: true,
        });

        if (respuesta.status === 409) {
          setHoraSeleccionada("");
          const refresco = await fetch(`/api/disponibilidad?fecha=${fechaSeleccionada}`, { cache: "no-store" });
          if (refresco.ok) {
            const disponibilidad = await refresco.json();
            setHorasOcupadas(disponibilidad.horasOcupadas ?? []);
          }
        }
        return;
      }

      setResultado({ reserva: datos.reserva, whatsapp: datos.whatsapp });
      await refrescarMes();

      toast({
        title: "¡Cita agendada!",
        description: `Tu código de reserva es ${datos.reserva.codigo}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de conexión",
        description: "No pudimos contactar el servidor. Revisa tu internet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setEnviando(false);
    }
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
    const hoy = new Date();
    const hoyClave = claveDia(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

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
      const clave = claveDia(year, month, day);
      const isPast = clave < hoyClave;
      const isFull = diasCompletos.includes(clave);
      const reservasDelDia = conteoPorDia[clave] ?? 0;
      const isSelected = fechaSeleccionada === clave;
      const disabled = isPast || isFull;

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
          onClick={() => {
            if (disabled) return;
            setFechaSeleccionada(clave);
            setHoraSeleccionada("");
          }}
          position="relative"
          border="1px solid"
          borderColor={reservasDelDia > 0 && !isSelected && !isPast ? "orange.300" : "transparent"}
        >
          {day}
          {reservasDelDia > 0 && !isPast && (
            <Box
              position="absolute"
              bottom="2px"
              left="50%"
              transform="translateX(-50%)"
              w="4px"
              h="4px"
              bg={isFull ? "red.400" : "orange.300"}
              borderRadius="full"
            />
          )}
        </Box>
      );
    }

    return (
      <Box bg="rgba(10, 15, 30, 0.4)" p={4} borderRadius="xl" border="1px solid rgba(0, 191, 255, 0.1)">
        <HStack justify="space-between" mb={4}>
          <IconButton aria-label="Mes anterior" icon={<FaChevronLeft />} size="sm" variant="ghost" color="urban.100" onClick={handlePrevMonth} />
          <HStack spacing={2}>
            <Text fontWeight="600" color="white" textTransform="capitalize">
              {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </Text>
            {cargandoMes && <Spinner size="xs" color="urban.400" />}
          </HStack>
          <IconButton aria-label="Mes siguiente" icon={<FaChevronRight />} size="sm" variant="ghost" color="urban.100" onClick={handleNextMonth} />
        </HStack>
        <SimpleGrid columns={7} spacing={1}>
          {days}
        </SimpleGrid>
        <HStack mt={4} fontSize="xs" color="whiteAlpha.600" justify="center" spacing={4} flexWrap="wrap">
          <HStack><Box w="8px" h="8px" bg="urban.500" borderRadius="full" /><Text>Seleccionado</Text></HStack>
          <HStack><Box w="8px" h="8px" bg="rgba(255,255,255,0.05)" borderRadius="full" /><Text>Libre</Text></HStack>
          <HStack><Box w="8px" h="8px" bg="orange.300" borderRadius="full" /><Text>Con reservas</Text></HStack>
          <HStack><Box w="8px" h="8px" bg="red.400" borderRadius="full" /><Text>Sin cupos</Text></HStack>
        </HStack>
      </Box>
    );
  };

  const renderExito = (datos: ResultadoReserva) => {
    const { whatsapp } = datos;

    return (
      <VStack spacing={5} align="stretch" py={2}>
        <VStack spacing={2}>
          <Box color="green.300" fontSize="4xl"><FaCheckCircle /></Box>
          <Text fontSize="xl" fontWeight="700" color="white">¡Cita agendada!</Text>
          <Badge bg="urban.500" color="urban.950" fontSize="md" px={3} py={1} borderRadius="full">
            {datos.reserva.codigo}
          </Badge>
        </VStack>

        <Alert
          status={whatsapp.enviado ? "success" : "info"}
          borderRadius="xl"
          bg="rgba(0,191,255,0.08)"
          color="white"
        >
          <AlertIcon />
          {whatsapp.enviado
            ? "Te enviamos la confirmación a tu WhatsApp."
            : "Guarda tu código de reserva: con él te atendemos en el taller."}
        </Alert>

        <Box bg="rgba(10, 15, 30, 0.4)" borderRadius="xl" p={4} border="1px solid rgba(0, 191, 255, 0.1)">
          <VStack align="stretch" spacing={2} fontSize="sm">
            <HStack justify="space-between" align="start">
              <Text color="whiteAlpha.600">Cliente</Text>
              <Text color="white" textAlign="right">{datos.reserva.nombre}</Text>
            </HStack>
            <HStack justify="space-between" align="start">
              <Text color="whiteAlpha.600">Moto</Text>
              <Text color="white" textAlign="right">{datos.reserva.marca} {datos.reserva.modelo} · {datos.reserva.placa}</Text>
            </HStack>
            <HStack justify="space-between" align="start">
              <Text color="whiteAlpha.600">Servicio</Text>
              <Text color="white" textAlign="right">{datos.reserva.servicio}</Text>
            </HStack>
            <HStack justify="space-between" align="start">
              <Text color="whiteAlpha.600">Fecha</Text>
              <Text color="white" textAlign="right">
                {datos.reserva.fecha.split("-").reverse().join("/")} · {datos.reserva.hora}
              </Text>
            </HStack>
            {datos.reserva.observaciones && (
              <HStack justify="space-between" align="start">
                <Text color="whiteAlpha.600">Observaciones</Text>
                <Text color="white" textAlign="right">{datos.reserva.observaciones}</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="urban.900" border="1px solid rgba(0, 191, 255, 0.3)" borderRadius="2xl" color="white" mx={4}>
        <ModalHeader color="urban.500" fontSize="2xl" textAlign="center" pt={8}>
          {resultado ? "Reserva confirmada" : "Reserva tu Cita"}
        </ModalHeader>
        <ModalCloseButton color="urban.100" />
        <ModalBody pb={6}>
          {resultado ? (
            renderExito(resultado)
          ) : (
            <form id="booking-form" onSubmit={handleBookingSubmit}>
              <VStack spacing={5} align="stretch">
                <Text fontSize="xs" fontWeight="700" letterSpacing="0.12em" color="urban.300" textTransform="uppercase">
                  Tus datos
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Nombre completo</FormLabel>
                    <Input
                      value={formulario.nombre}
                      onChange={(e) => actualizarCampo("nombre", e.target.value.replace(/[0-9]/g, ""))}
                      placeholder="Escribe tu nombre"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Cédula de ciudadanía</FormLabel>
                    <Input
                      value={formulario.cedula}
                      onChange={(e) =>
                        actualizarCampo(
                          "cedula",
                          e.target.value.replace(/\D/g, "").slice(0, CEDULA_LONGITUD_MAX),
                        )
                      }
                      placeholder="1020304050"
                      inputMode="numeric"
                      maxLength={CEDULA_LONGITUD_MAX}
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                    <FormHelperText color="whiteAlpha.500" fontSize="xs">
                      {formulario.cedula.length > 0
                        ? `${formulario.cedula.length}/${CEDULA_LONGITUD_MAX} dígitos`
                        : `Máximo ${CEDULA_LONGITUD_MAX} dígitos`}{" "}
                      · las cédulas antiguas pueden tener menos.
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired isInvalid={celularIncompleto}>
                    <FormLabel color="urban.100" fontSize="sm">Celular (WhatsApp)</FormLabel>
                    <HStack spacing={2} align="start">
                      <Select
                        aria-label="Código de país"
                        value={codigoPais}
                        onChange={(evento) => setCodigoPais(evento.target.value)}
                        w="8.5rem"
                        flexShrink={0}
                        bg="rgba(10,15,30,0.4)"
                        borderRadius="xl"
                        _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                        // El estado inválido pertenece al número, no al indicativo.
                        borderColor="rgba(120,166,255,0.3)"
                      >
                        {CODIGOS_PAIS.map((pais) => (
                          <option key={pais.iso} value={pais.codigo} style={{ background: "#0f1c37" }}>
                            {pais.bandera} {pais.codigo}
                          </option>
                        ))}
                      </Select>
                      <Input
                        value={formulario.celular}
                        onChange={(e) =>
                          actualizarCampo(
                            "celular",
                            e.target.value.replace(/\D/g, "").slice(0, paisSeleccionado.digitosLocal),
                          )
                        }
                        placeholder={paisSeleccionado.iso === "CO" ? "3001234567" : "Número local"}
                        inputMode="tel"
                        maxLength={paisSeleccionado.digitosLocal}
                        borderColor={celularIncompleto ? "red.400" : undefined}
                        _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                        borderRadius="xl"
                      />
                    </HStack>
                    {celularIncompleto ? (
                      <FormErrorMessage fontSize="xs">
                        Faltan {paisSeleccionado.digitosLocal - formulario.celular.length} dígitos para{" "}
                        {paisSeleccionado.nombre}.
                      </FormErrorMessage>
                    ) : (
                      <FormHelperText color="whiteAlpha.500" fontSize="xs">
                        {paisSeleccionado.bandera} {paisSeleccionado.nombre} · {codigoPais}{" "}
                        {paisSeleccionado.digitosLocal} dígitos. Aquí te llega la confirmación.
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel color="urban.100" fontSize="sm">Correo electrónico (opcional)</FormLabel>
                    <Input
                      value={formulario.email}
                      onChange={(e) => actualizarCampo("email", e.target.value)}
                      type="email"
                      placeholder="tucorreo@email.com"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider borderColor="rgba(0,191,255,0.15)" />

                <Text fontSize="xs" fontWeight="700" letterSpacing="0.12em" color="urban.300" textTransform="uppercase">
                  Tu moto
                </Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Placa</FormLabel>
                    <Input
                      value={formulario.placa}
                      onChange={(e) => actualizarCampo("placa", e.target.value.toUpperCase())}
                      placeholder="ABC12D"
                      maxLength={7}
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Marca</FormLabel>
                    <Input
                      value={formulario.marca}
                      onChange={(e) => actualizarCampo("marca", e.target.value)}
                      placeholder="Yamaha"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Modelo</FormLabel>
                    <Input
                      value={formulario.modelo}
                      onChange={(e) => actualizarCampo("modelo", e.target.value)}
                      placeholder="R15"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider borderColor="rgba(0,191,255,0.15)" />

                <Text fontSize="xs" fontWeight="700" letterSpacing="0.12em" color="urban.300" textTransform="uppercase">
                  Tu cita
                </Text>
                <FormControl isRequired>
                  <FormLabel color="urban.100" fontSize="sm">Selecciona una fecha</FormLabel>
                  {renderCalendar()}
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Hora disponible</FormLabel>
                    <Select
                      value={horaSeleccionada}
                      onChange={(e) => setHoraSeleccionada(e.target.value)}
                      placeholder={fechaSeleccionada ? "Selecciona una hora" : "Primero elige la fecha"}
                      isDisabled={!fechaSeleccionada}
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                      bg="rgba(10,15,30,0.4)"
                    >
                      {HORAS_DISPONIBLES.map((hora) => {
                        const ocupada = horasOcupadas.includes(hora);
                        return (
                          <option key={hora} value={hora} disabled={ocupada} style={{ background: "#0f1c37" }}>
                            {hora}{ocupada ? " · ocupado" : ""}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="urban.100" fontSize="sm">Servicio / Paquete</FormLabel>
                    <Select
                      value={selectedPackage}
                      onChange={(event) => setSelectedPackage(event.target.value)}
                      placeholder="¿Qué servicio deseas?"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                      borderRadius="xl"
                      bg="rgba(10,15,30,0.4)"
                      required
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.title} value={pkg.title} style={{ background: "#0f1c37" }}>
                          {pkg.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel color="urban.100" fontSize="sm">Observaciones (opcional)</FormLabel>
                  <Textarea
                    value={formulario.observaciones}
                    onChange={(e) => actualizarCampo("observaciones", e.target.value)}
                    placeholder="Ej: tiene rayones en el tanque, evitar esa zona."
                    minH="90px"
                    _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                    borderRadius="xl"
                  />
                </FormControl>
              </VStack>
            </form>
          )}
        </ModalBody>

        <ModalFooter borderTop="1px solid rgba(0, 191, 255, 0.1)" bg="rgba(0, 191, 255, 0.02)" borderBottomRadius="2xl">
          {resultado ? (
            <HStack spacing={3} w="100%" justify="flex-end" flexWrap="wrap">
              <Button variant="ghost" onClick={onClose} color="urban.100" _hover={{ bg: "whiteAlpha.200" }} borderRadius="full">
                Cerrar
              </Button>
            </HStack>
          ) : (
            <>
              <Button variant="ghost" mr={3} onClick={onClose} color="urban.100" _hover={{ bg: "whiteAlpha.200" }} borderRadius="full">
                Cancelar
              </Button>
              <Button
                form="booking-form"
                type="submit"
                isLoading={enviando}
                loadingText="Agendando..."
                bg="urban.500"
                color="urban.950"
                _hover={{ bg: "urban.400" }}
                borderRadius="full"
                px={8}
              >
                Confirmar Cita
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
"use client";

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaSyncAlt,
  FaTrash,
  FaWhatsapp,
} from "react-icons/fa";
import {
  ESTADOS_RESERVA,
  ETIQUETAS_ESTADO,
  formatoFechaISO,
  type EstadoReserva,
} from "@/src/lib/reservas";
import type { ReservaJSON } from "@/src/lib/reservas-json";

const COLOR_ESTADO: Record<EstadoReserva, string> = {
  pendiente: "yellow",
  confirmada: "blue",
  en_proceso: "purple",
  completada: "green",
  cancelada: "red",
};

type RangoRapido = "todas" | "hoy" | "manana" | "semana" | "mes";

const ETIQUETAS_RANGO: Record<RangoRapido, string> = {
  todas: "Todas",
  hoy: "Hoy",
  manana: "Mañana",
  semana: "7 días",
  mes: "Este mes",
};

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function formatearFecha(iso: string): string {
  return iso.split("-").reverse().join("/");
}

/** Encabezado legible de un día: "sábado, 22 de octubre de 2026". */
function tituloDelDia(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00Z`);
  return fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Hoy" / "Mañana" / "Pasado" para dar contexto rápido. */
function contextoDelDia(iso: string): string | null {
  const hoy = formatoFechaISO(new Date());
  const manana = formatoFechaISO(sumarDias(new Date(), 1));

  if (iso === hoy) return "Hoy";
  if (iso === manana) return "Mañana";
  if (iso < hoy) return "Pasado";
  return null;
}

function enlaceWhatsApp(reserva: ReservaJSON): string {
  const numero = reserva.celular.replace(/\D/g, "");
  const texto = `Hola ${reserva.nombre}, te escribimos de Urban Moto Gleam sobre tu reserva ${reserva.codigo} (${reserva.servicio}) del ${formatearFecha(reserva.fecha)} a las ${reserva.hora}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function AdminPanel() {
  const toast = useToast();
  const router = useRouter();
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [reservas, setReservas] = useState<ReservaJSON[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rangoRapido, setRangoRapido] = useState<RangoRapido>("todas");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [sembrando, setSembrando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const cargar = useCallback(async () => {
    try {
      const parametros = new URLSearchParams();
      if (filtroEstado !== "todas") parametros.set("estado", filtroEstado);
      if (busqueda.trim()) parametros.set("q", busqueda.trim());
      if (desde) parametros.set("desde", desde);
      if (hasta) parametros.set("hasta", hasta);

      const respuesta = await fetch(`/api/reservas?${parametros.toString()}`, { cache: "no-store" });

      if (respuesta.status === 401) {
        router.replace("/admin/login?next=/admin");
        return;
      }

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudieron cargar las reservas.");
        setReservas([]);
        return;
      }

      setReservas(datos.reservas ?? []);
      setError("");
      setUltimaActualizacion(new Date().toLocaleTimeString("es-CO"));
    } catch {
      setError("No se pudo conectar con el servidor. ¿Está MongoDB encendido?");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda, desde, hasta, router]);

  // Carga inicial + recarga cuando cambian los filtros (con pequeño debounce al buscar).
  useEffect(() => {
    const temporizador = setTimeout(() => {
      void cargar();
    }, busqueda ? 350 : 0);

    return () => clearTimeout(temporizador);
  }, [cargar, busqueda]);

  // Refresco automático cada 30 segundos para ver las reservas "en vivo".
  useEffect(() => {
    const intervalo = setInterval(() => {
      void cargar();
    }, 30_000);

    return () => clearInterval(intervalo);
  }, [cargar]);

  /** Aplica un rango de fecha predefinido. */
  const aplicarRango = (rango: RangoRapido) => {
    setRangoRapido(rango);
    const hoy = new Date();

    if (rango === "todas") {
      setDesde("");
      setHasta("");
      return;
    }

    if (rango === "hoy") {
      const clave = formatoFechaISO(hoy);
      setDesde(clave);
      setHasta(clave);
      return;
    }

    if (rango === "manana") {
      const clave = formatoFechaISO(sumarDias(hoy, 1));
      setDesde(clave);
      setHasta(clave);
      return;
    }

    if (rango === "semana") {
      setDesde(formatoFechaISO(hoy));
      setHasta(formatoFechaISO(sumarDias(hoy, 6)));
      return;
    }

    // Este mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    setDesde(formatoFechaISO(inicioMes));
    setHasta(formatoFechaISO(finMes));
  };

  const cambiarFechaManual = (campo: "desde" | "hasta", valor: string) => {
    setRangoRapido("todas");
    if (campo === "desde") setDesde(valor);
    else setHasta(valor);
  };

  const resumen = useMemo(() => {
    const hoy = formatoFechaISO(new Date());
    const activas = reservas.filter((reserva) => reserva.estado !== "cancelada");

    return {
      total: reservas.length,
      pendientes: reservas.filter((reserva) => reserva.estado === "pendiente").length,
      confirmadas: reservas.filter((reserva) => reserva.estado === "confirmada").length,
      paraHoy: activas.filter((reserva) => reserva.fecha === hoy).length,
    };
  }, [reservas]);

  /** Agrupa las reservas por día de la cita; el servidor ya las envía ordenadas. */
  const grupos = useMemo(() => {
    const mapa = new Map<string, ReservaJSON[]>();

    for (const reserva of reservas) {
      const lista = mapa.get(reserva.fecha);
      if (lista) lista.push(reserva);
      else mapa.set(reserva.fecha, [reserva]);
    }

    return Array.from(mapa.entries())
      .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
      .map(([fecha, lista]) => ({
        fecha,
        reservas: [...lista].sort((a, b) => a.hora.localeCompare(b.hora)),
      }));
  }, [reservas]);

  const cambiarEstado = async (id: string, estado: EstadoReserva) => {
    setActualizandoId(id);
    try {
      const respuesta = await fetch(`/api/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        toast({ title: "No se pudo actualizar", description: datos.error, status: "error", duration: 5000, isClosable: true });
        return;
      }

      setReservas((previas) => previas.map((reserva) => (reserva.id === id ? datos.reserva : reserva)));
      toast({ title: `Estado: ${ETIQUETAS_ESTADO[estado]}`, status: "success", duration: 2500, isClosable: true });
    } catch {
      toast({ title: "Error de conexión", status: "error", duration: 4000, isClosable: true });
    } finally {
      setActualizandoId(null);
    }
  };

  const eliminarReserva = async (reserva: ReservaJSON) => {
    if (!window.confirm(`¿Eliminar la reserva ${reserva.codigo}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActualizandoId(reserva.id);
    try {
      const respuesta = await fetch(`/api/reservas/${reserva.id}`, { method: "DELETE" });
      if (!respuesta.ok) {
        const datos = await respuesta.json();
        toast({ title: "No se pudo eliminar", description: datos.error, status: "error", duration: 5000, isClosable: true });
        return;
      }

      setReservas((previas) => previas.filter((item) => item.id !== reserva.id));
      toast({ title: "Reserva eliminada", status: "success", duration: 2500, isClosable: true });
    } catch {
      toast({ title: "Error de conexión", status: "error", duration: 4000, isClosable: true });
    } finally {
      setActualizandoId(null);
    }
  };

  const sembrarContenido = async () => {
    setSembrando(true);
    try {
      const respuesta = await fetch("/api/admin/seed", { method: "POST" });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        toast({ title: "No se pudo sembrar el contenido", description: datos.error, status: "error", duration: 6000, isClosable: true });
        return;
      }

      toast({
        title: "Contenido sembrado",
        description: `${datos.paquetes} paquetes · ${datos.faqs} FAQs · ${datos.proceso} pasos · ${datos.testimonios} testimonios`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    } catch {
      toast({ title: "Error de conexión", status: "error", duration: 4000, isClosable: true });
    } finally {
      setSembrando(false);
    }
  };

  const cerrarSesion = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  if (!montado) {
    return <div style={{ minHeight: "100vh", background: "#070b18" }} />;
  }

  const hayFiltrosActivos =
    Boolean(busqueda.trim()) || filtroEstado !== "todas" || Boolean(desde) || Boolean(hasta);

  return (
    <Box minH="100vh" bg="urban.950" color="white" py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={8}>
          <Box>
            <Heading fontFamily="heading" fontWeight="400" fontSize={{ base: "2xl", md: "4xl" }}>
              Panel de reservas
            </Heading>
            <Text color="whiteAlpha.600" fontSize="sm">
              Urban Moto Gleam · {ultimaActualizacion ? `actualizado ${ultimaActualizacion}` : "cargando..."} · se refresca cada 30 s
            </Text>
          </Box>
          <HStack spacing={3} wrap="wrap">
            <Button as="a" href="/" variant="outline" borderRadius="full" leftIcon={<FaExternalLinkAlt />} borderColor="urban.500" color="urban.100" _hover={{ bg: "rgba(0,191,255,0.1)" }}>
              Ver sitio
            </Button>
            <Button onClick={sembrarContenido} isLoading={sembrando} variant="outline" borderRadius="full" borderColor="urban.500" color="urban.100" _hover={{ bg: "rgba(0,191,255,0.1)" }}>
              Sembrar contenido
            </Button>
            <Button onClick={() => void cargar()} borderRadius="full" leftIcon={<FaSyncAlt />} bg="urban.500" color="urban.950" _hover={{ bg: "urban.400" }}>
              Refrescar
            </Button>
            <Button onClick={() => void cerrarSesion()} variant="ghost" borderRadius="full" leftIcon={<FaSignOutAlt />} color="whiteAlpha.700" _hover={{ bg: "rgba(245,101,101,0.15)", color: "red.200" }}>
              Cerrar sesión
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={7}>
          <Stat bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={5} border="1px solid rgba(0,191,255,0.15)">
            <StatLabel color="whiteAlpha.600">Reservas</StatLabel>
            <StatNumber color="urban.400">{resumen.total}</StatNumber>
          </Stat>
          <Stat bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={5} border="1px solid rgba(0,191,255,0.15)">
            <StatLabel color="whiteAlpha.600">Pendientes</StatLabel>
            <StatNumber color="yellow.300">{resumen.pendientes}</StatNumber>
          </Stat>
          <Stat bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={5} border="1px solid rgba(0,191,255,0.15)">
            <StatLabel color="whiteAlpha.600">Confirmadas</StatLabel>
            <StatNumber color="blue.300">{resumen.confirmadas}</StatNumber>
          </Stat>
          <Stat bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={5} border="1px solid rgba(0,191,255,0.15)">
            <StatLabel color="whiteAlpha.600">Para hoy</StatLabel>
            <StatNumber color="green.300">{resumen.paraHoy}</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* ── Filtros ─────────────────────────────────────────── */}
        <Box bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={{ base: 4, md: 5 }} border="1px solid rgba(0,191,255,0.15)" mb={6}>
          <HStack spacing={2} mb={4} color="urban.300" fontSize="xs" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase">
            <FaCalendarAlt />
            <Text>Filtrar por fecha</Text>
          </HStack>

          <ButtonGroup size="sm" isAttached variant="outline" flexWrap="wrap" mb={4}>
            {(Object.keys(ETIQUETAS_RANGO) as RangoRapido[]).map((rango) => (
              <Button
                key={rango}
                onClick={() => aplicarRango(rango)}
                bg={rangoRapido === rango ? "urban.500" : "transparent"}
                color={rangoRapido === rango ? "urban.950" : "urban.100"}
                borderColor="rgba(120,166,255,0.35)"
                _hover={{ bg: rangoRapido === rango ? "urban.400" : "rgba(0,191,255,0.12)" }}
              >
                {ETIQUETAS_RANGO[rango]}
              </Button>
            ))}
          </ButtonGroup>

          <HStack spacing={4} wrap="wrap">
            <Box>
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>Desde</Text>
              <Input
                type="date"
                value={desde}
                onChange={(evento) => cambiarFechaManual("desde", evento.target.value)}
                maxW="190px"
                borderRadius="xl"
                bg="rgba(10,15,30,0.8)"
                borderColor="rgba(120,166,255,0.3)"
                sx={{ "&::-webkit-calendar-picker-indicator": { filter: "invert(0.8)" } }}
                _focus={{ borderColor: "urban.500", boxShadow: "none" }}
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>Hasta</Text>
              <Input
                type="date"
                value={hasta}
                onChange={(evento) => cambiarFechaManual("hasta", evento.target.value)}
                maxW="190px"
                borderRadius="xl"
                bg="rgba(10,15,30,0.8)"
                borderColor="rgba(120,166,255,0.3)"
                sx={{ "&::-webkit-calendar-picker-indicator": { filter: "invert(0.8)" } }}
                _focus={{ borderColor: "urban.500", boxShadow: "none" }}
              />
            </Box>
            <Box flex="1" minW="220px">
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>Buscar</Text>
              <Input
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Código, nombre, placa, cédula o celular"
                borderRadius="xl"
                bg="rgba(10,15,30,0.8)"
                borderColor="rgba(120,166,255,0.3)"
                _placeholder={{ color: "whiteAlpha.500" }}
                _focus={{ borderColor: "urban.500", boxShadow: "none" }}
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>Estado</Text>
              <Select
                value={filtroEstado}
                onChange={(evento) => setFiltroEstado(evento.target.value)}
                w="190px"
                borderRadius="xl"
                bg="rgba(10,15,30,0.8)"
                borderColor="rgba(120,166,255,0.3)"
                _focus={{ borderColor: "urban.500", boxShadow: "none" }}
              >
                <option value="todas" style={{ background: "#0f1c37" }}>Todos</option>
                {ESTADOS_RESERVA.map((estado) => (
                  <option key={estado} value={estado} style={{ background: "#0f1c37" }}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </Select>
            </Box>
            {hayFiltrosActivos && (
              <Button
                alignSelf="flex-end"
                size="sm"
                variant="ghost"
                color="whiteAlpha.600"
                _hover={{ color: "urban.400" }}
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todas");
                  aplicarRango("todas");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </HStack>
        </Box>

        {error && (
          <Box bg="rgba(245,101,101,0.12)" border="1px solid rgba(245,101,101,0.4)" borderRadius="xl" p={4} mb={5}>
            <Text color="red.200">{error}</Text>
          </Box>
        )}

        {cargando ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="urban.500" thickness="3px" />
          </Flex>
        ) : grupos.length === 0 ? (
          <Box bg="rgba(10,15,30,0.6)" borderRadius="2xl" p={12} textAlign="center" border="1px solid rgba(0,191,255,0.15)">
            <Text color="whiteAlpha.700" fontSize="lg">No hay reservas que coincidan con el filtro.</Text>
            <Text color="whiteAlpha.500" fontSize="sm" mt={2}>
              Prueba con otro rango de fechas o haz una reserva desde el sitio.
            </Text>
          </Box>
        ) : (
          /* ── Agenda agrupada por día ───────────────────────── */
          <VStack spacing={6} align="stretch">
            {grupos.map((grupo) => {
              const contexto = contextoDelDia(grupo.fecha);
              const canceladas = grupo.reservas.filter((r) => r.estado === "cancelada").length;

              return (
                <Box
                  key={grupo.fecha}
                  bg="rgba(10,15,30,0.6)"
                  borderRadius="2xl"
                  border="1px solid rgba(0,191,255,0.15)"
                  overflow="hidden"
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={3}
                    px={{ base: 4, md: 5 }}
                    py={3.5}
                    bg="rgba(0,191,255,0.05)"
                    borderBottom="1px solid rgba(0,191,255,0.15)"
                  >
                    <HStack spacing={3} wrap="wrap">
                      <Text fontSize="md" fontWeight="600" textTransform="capitalize" color="white">
                        {tituloDelDia(grupo.fecha)}
                      </Text>
                      {contexto && (
                        <Badge
                          borderRadius="full"
                          px={2.5}
                          colorScheme={contexto === "Hoy" ? "green" : contexto === "Pasado" ? "gray" : "blue"}
                        >
                          {contexto}
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={3}>
                      <Text fontSize="xs" color="whiteAlpha.600">
                        {grupo.reservas.length} reserva{grupo.reservas.length === 1 ? "" : "s"}
                        {canceladas > 0 ? ` · ${canceladas} cancelada${canceladas === 1 ? "" : "s"}` : ""}
                      </Text>
                    </HStack>
                  </Flex>

                  <TableContainer>
                    <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                      <Thead>
                        <Tr>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)" w="90px">Hora</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)">Cliente</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)">Moto</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)">Servicio</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)" w="60px">Código</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)">Estado</Th>
                          <Th color="urban.300" borderColor="rgba(0,191,255,0.15)" w="110px">Acciones</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {grupo.reservas.map((reserva) => (
                          <Tr
                            key={reserva.id}
                            _hover={{ bg: "rgba(0,191,255,0.05)" }}
                            opacity={reserva.estado === "cancelada" ? 0.55 : 1}
                          >
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <Text fontWeight="700" color="urban.400" fontSize="md">{reserva.hora}</Text>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="600">{reserva.nombre}</Text>
                                <Text fontSize="xs" color="whiteAlpha.500">CC {reserva.cedula}</Text>
                                <HStack spacing={1} as="a" href={enlaceWhatsApp(reserva)} target="_blank" rel="noopener noreferrer" color="green.300" fontSize="xs">
                                  <FaWhatsapp />
                                  <Text>{reserva.celular}</Text>
                                </HStack>
                              </VStack>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="600" letterSpacing="0.06em">{reserva.placa}</Text>
                                <Text fontSize="xs" color="whiteAlpha.500">{reserva.marca} {reserva.modelo}</Text>
                              </VStack>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)" maxW="220px">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{reserva.servicio}</Text>
                                {reserva.observaciones && (
                                  <Text fontSize="xs" color="whiteAlpha.500" noOfLines={2}>{reserva.observaciones}</Text>
                                )}
                              </VStack>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <Text fontSize="xs" color="whiteAlpha.600" fontFamily="monospace">{reserva.codigo}</Text>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <VStack align="start" spacing={2}>
                                <Badge colorScheme={COLOR_ESTADO[reserva.estado]} borderRadius="full" px={2}>
                                  {ETIQUETAS_ESTADO[reserva.estado]}
                                </Badge>
                                <Select
                                  size="xs"
                                  value={reserva.estado}
                                  isDisabled={actualizandoId === reserva.id}
                                  onChange={(evento) => void cambiarEstado(reserva.id, evento.target.value as EstadoReserva)}
                                  bg="rgba(10,15,30,0.8)"
                                  borderRadius="md"
                                  borderColor="rgba(120,166,255,0.3)"
                                  _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                                  w="150px"
                                >
                                  {ESTADOS_RESERVA.map((estado) => (
                                    <option key={estado} value={estado} style={{ background: "#0f1c37" }}>
                                      {ETIQUETAS_ESTADO[estado]}
                                    </option>
                                  ))}
                                </Select>
                              </VStack>
                            </Td>
                            <Td borderColor="rgba(0,191,255,0.1)">
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                leftIcon={<FaTrash />}
                                isLoading={actualizandoId === reserva.id}
                                onClick={() => void eliminarReserva(reserva)}
                              >
                                Borrar
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
          </VStack>
        )}
      </Container>
    </Box>
  );
}

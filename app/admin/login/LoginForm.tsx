"use client";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";

export function LoginForm({ destino }: { destino: string }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Chakra inyecta estilos globales en el cliente: hasta montar, se pinta un
  // fondo plano para que el HTML del servidor coincida con el del navegador.
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.replace(destino);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (!montado) {
    return <div style={{ minHeight: "100vh", background: "#070b18" }} />;
  }

  return (
    <Box
      minH="100vh"
      bg="radial-gradient(1200px 700px at 30% -10%, #123052 0%, #070b18 55%)"
      color="white"
      display="flex"
      alignItems="center"
      py={10}
    >
      <Container maxW="420px">
        <VStack spacing={7} align="stretch">
          <VStack spacing={2}>
            <Box
              w="56px"
              h="56px"
              borderRadius="2xl"
              display="grid"
              placeItems="center"
              bg="rgba(0,191,255,0.12)"
              border="1px solid rgba(0,191,255,0.35)"
              color="urban.400"
              fontSize="22px"
            >
              <FaLock />
            </Box>
            <Heading fontFamily="heading" fontWeight="400" fontSize="2xl" textAlign="center">
              Panel de reservas
            </Heading>
            <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
              Acceso exclusivo del taller · Urban Moto Gleam
            </Text>
          </VStack>

          <Box
            bg="rgba(10,15,30,0.75)"
            border="1px solid rgba(0,191,255,0.2)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
          >
            <form onSubmit={enviar}>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="urban.100">Usuario</FormLabel>
                  <InputGroup>
                    <Input
                      value={usuario}
                      onChange={(evento) => setUsuario(evento.target.value)}
                      placeholder="Tu usuario"
                      autoComplete="username"
                      autoFocus
                      pl={10}
                      borderRadius="xl"
                      bg="rgba(10,15,30,0.4)"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                    />
                    <InputRightElement pointerEvents="none" color="whiteAlpha.500">
                      <FaUser />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="urban.100">Contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      value={contrasena}
                      onChange={(evento) => setContrasena(evento.target.value)}
                      type={verContrasena ? "text" : "password"}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      pr={12}
                      borderRadius="xl"
                      bg="rgba(10,15,30,0.4)"
                      _focus={{ borderColor: "urban.500", boxShadow: "none" }}
                    />
                    <InputRightElement width="2.75rem">
                      <IconButton
                        aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                        icon={verContrasena ? <FaEyeSlash /> : <FaEye />}
                        size="sm"
                        variant="ghost"
                        color="whiteAlpha.600"
                        onClick={() => setVerContrasena(!verContrasena)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {error && (
                  <Alert status="error" borderRadius="xl" bg="rgba(245,101,101,0.12)">
                    <AlertIcon />
                    <Text fontSize="sm">{error}</Text>
                  </Alert>
                )}

                <Button
                  type="submit"
                  isLoading={enviando}
                  loadingText="Verificando..."
                  bg="urban.500"
                  color="urban.950"
                  _hover={{ bg: "urban.400" }}
                  borderRadius="full"
                  h={10}
                >
                  Entrar al panel
                </Button>
              </VStack>
            </form>
          </Box>

          <Button
            as="a"
            href="/"
            variant="ghost"
            size="sm"
            color="whiteAlpha.600"
            _hover={{ color: "urban.400", bg: "transparent" }}
          >
            ← Volver al sitio
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

/**
 * Limitador de intentos en memoria, suficiente para el despliegue local del
 * proyecto. En un servidor con varias instancias habría que usar Redis.
 */
type Registro = {
  intentos: number;
  primerIntento: number;
  bloqueadoHasta: number;
};

const registros = new Map<string, Registro>();

const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

export type EstadoLimite = {
  permitido: boolean;
  intentosRestantes: number;
  /** Segundos que faltan para poder reintentar (solo si está bloqueado). */
  esperaSegundos: number;
};

export function revisarLimite(clave: string): EstadoLimite {
  const ahora = Date.now();
  const registro = registros.get(clave);

  if (!registro) {
    return { permitido: true, intentosRestantes: MAX_INTENTOS, esperaSegundos: 0 };
  }

  if (registro.bloqueadoHasta > ahora) {
    return {
      permitido: false,
      intentosRestantes: 0,
      esperaSegundos: Math.ceil((registro.bloqueadoHasta - ahora) / 1000),
    };
  }

  // La ventana expiró: se reinicia el contador.
  if (ahora - registro.primerIntento > VENTANA_MS) {
    registros.delete(clave);
    return { permitido: true, intentosRestantes: MAX_INTENTOS, esperaSegundos: 0 };
  }

  return {
    permitido: true,
    intentosRestantes: Math.max(0, MAX_INTENTOS - registro.intentos),
    esperaSegundos: 0,
  };
}

export function registrarFallo(clave: string): void {
  const ahora = Date.now();
  const registro = registros.get(clave);

  if (!registro || ahora - registro.primerIntento > VENTANA_MS) {
    registros.set(clave, { intentos: 1, primerIntento: ahora, bloqueadoHasta: 0 });
    return;
  }

  registro.intentos += 1;

  if (registro.intentos >= MAX_INTENTOS) {
    registro.bloqueadoHasta = ahora + BLOQUEO_MS;
  }
}

export function limpiarIntentos(clave: string): void {
  registros.delete(clave);
}

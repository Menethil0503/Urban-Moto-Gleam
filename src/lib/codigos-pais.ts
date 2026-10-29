/**
 * Lista corta de códigos de país con su bandera, usada en el modal de reserva.
 * `codigo` es el indicativo telefónico; `digitosLocal` es la longitud típica del
 * número local (sin el indicativo), útil para la ayuda en pantalla.
 */
export type CodigoPais = {
  codigo: string;
  iso: string;
  bandera: string;
  nombre: string;
  digitosLocal: number;
};

export const CODIGOS_PAIS: CodigoPais[] = [
  { codigo: "+57", iso: "CO", bandera: "🇨🇴", nombre: "Colombia", digitosLocal: 10 },
  { codigo: "+52", iso: "MX", bandera: "🇲🇽", nombre: "México", digitosLocal: 10 },
  { codigo: "+51", iso: "PE", bandera: "🇵🇪", nombre: "Perú", digitosLocal: 9 },
  { codigo: "+593", iso: "EC", bandera: "🇪🇨", nombre: "Ecuador", digitosLocal: 9 },
  { codigo: "+58", iso: "VE", bandera: "🇻🇪", nombre: "Venezuela", digitosLocal: 10 },
  { codigo: "+56", iso: "CL", bandera: "🇨🇱", nombre: "Chile", digitosLocal: 9 },
  { codigo: "+54", iso: "AR", bandera: "🇦🇷", nombre: "Argentina", digitosLocal: 10 },
  { codigo: "+55", iso: "BR", bandera: "🇧🇷", nombre: "Brasil", digitosLocal: 11 },
  { codigo: "+591", iso: "BO", bandera: "🇧🇴", nombre: "Bolivia", digitosLocal: 8 },
  { codigo: "+595", iso: "PY", bandera: "🇵🇾", nombre: "Paraguay", digitosLocal: 9 },
  { codigo: "+598", iso: "UY", bandera: "🇺🇾", nombre: "Uruguay", digitosLocal: 8 },
  { codigo: "+507", iso: "PA", bandera: "🇵🇦", nombre: "Panamá", digitosLocal: 8 },
  { codigo: "+506", iso: "CR", bandera: "🇨🇷", nombre: "Costa Rica", digitosLocal: 8 },
  { codigo: "+502", iso: "GT", bandera: "🇬🇹", nombre: "Guatemala", digitosLocal: 8 },
  { codigo: "+1", iso: "US", bandera: "🇺🇸", nombre: "Estados Unidos", digitosLocal: 10 },
  { codigo: "+34", iso: "ES", bandera: "🇪🇸", nombre: "España", digitosLocal: 9 },
];

export const CODIGO_PAIS_POR_DEFECTO = "+57";

export function obtenerCodigoPais(codigo: string): CodigoPais {
  return CODIGOS_PAIS.find((pais) => pais.codigo === codigo) ?? CODIGOS_PAIS[0];
}

/** Une indicativo + número local y deja solo dígitos (formato E.164 sin “+”). */
export function unirCelular(codigo: string, numeroLocal: string): string {
  return `${codigo}${numeroLocal}`.replace(/\D/g, "");
}

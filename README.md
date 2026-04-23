# Urban Moto Gleam - Landing Page Premium

Landing page Awwwards-style para un lavadero ficticio de motos en Bogotá, construida con:

- Next.js (App Router, SSR)
- Chakra UI + Framer Motion
- GSAP (`ScrollTrigger`, `ScrollToPlugin`, `SplitText`, `Draggable`)
- `react-intersection-observer`
- Datos dinámicos desde `data.json`

## Ejecutar en local

Instala dependencias y ejecuta el proyecto:

```bash
pnpm install
pnpm dev

# o con npm
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura principal

- `app/page.tsx`: punto de entrada de la landing.
- `src/components/LandingPage.tsx`: secciones completas y animaciones GSAP.
- `app/providers.tsx`: provider global de Chakra.
- `lib/theme.ts`: tema y tokens visuales urban-elegant.
- `data.json`: contenido dinámico de empresa, servicios, precios y testimonios.
- `public/icons/*.svg` y `public/logo-moto.svg`: assets SVG personalizados.

## Scripts

- `pnpm dev`: desarrollo.
- `pnpm build`: build producción.
- `pnpm start`: correr build.
- `pnpm lint`: linting.

## Notas de animación

- Se usa `SplitText` con fallback automático cuando el plugin no está disponible.
- `Draggable` controla el slider Antes/Después.
- `ScrollTrigger` aplica stagger/fade/parallax por sección.

## Accesibilidad y performance

- Botones e inputs con `aria-label`.
- Imágenes con `loading="lazy"` cuando aplica.
- Arquitectura modular para facilitar optimizaciones posteriores.


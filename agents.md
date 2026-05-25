# agents.md

## Regla principal

Este repositorio usa una base Astro que debe mantenerse ligera, traducible, modular, mantenible y preparada para desplegarse correctamente, incluyendo GitHub Pages cuando aplique.

Las reglas de este archivo son obligatorias. Todo agente, asistente IA o automatización que modifique este repositorio debe leerlas, aplicarlas y comprobarlas antes de terminar cualquier tarea.

Antes de modificar páginas, layouts, componentes, estilos, SEO, rutas, i18n, tests, documentación o despliegue, el agente debe consultar estas guías cuando existan:

- `docs/design-system.md`
- `docs/template-usage.md`
- `docs/i18n-guide.md`
- `docs/github-pages.md`
- `docs/testing-guide.md`

## Prioridad

Estas instrucciones tienen prioridad sobre patrones antiguos, preferencias implícitas o soluciones rápidas, salvo que el usuario indique expresamente lo contrario.

Si existe conflicto entre una tarea y estas reglas, el agente debe cumplir la petición del usuario en la medida posible, mantener el proyecto pequeño, modular y traducible, y explicar cualquier excepción relevante en el resumen final.

## Principios obligatorios

- Mobile first.
- Diseño profesional, limpio, moderno y vistoso.
- Light mode y dark mode en todos los componentes nuevos.
- No usar fuentes externas de Google Fonts, Adobe Fonts ni CDNs similares.
- Usar system fonts.
- Evitar dependencias innecesarias.
- Cuidar Core Web Vitals.
- HTML semántico.
- Buen SEO técnico.
- Accesibilidad mínima WCAG AA.
- Componentes reutilizables.
- Variables CSS globales para colores, radios, sombras, espaciados y transiciones.
- Mantener el soporte i18n de Astro.
- Mantener compatibilidad con despliegues en dominio raíz (`/`) y en subruta (`/nombre-del-repositorio/` o similar).
- Mantener compatibilidad con GitHub Pages en subcarpeta cuando aplique.
- Mantener tests smoke simples y útiles.
- Mantener los ficheros lo más pequeños posible.
- Dividir el código por responsabilidad cuando un fichero crezca demasiado.
- Generar toda UI nueva preparada para todos los idiomas configurados.
- Seguir estándares de calidad, legibilidad, modularidad y mantenibilidad.

## Reglas obligatorias para agentes e IA

Todo agente IA debe aplicar estas reglas en cualquier cambio:

1. Respetar siempre este archivo y la documentación de `docs/`.
2. No generar soluciones monolíticas si pueden dividirse en componentes, helpers, constantes o módulos pequeños.
3. No añadir texto visible en un único idioma dentro de componentes, layouts o páginas reutilizables.
4. No dejar idiomas incompletos: toda clave nueva debe existir en todos los JSON de traducción configurados.
5. No añadir dependencias si la solución puede hacerse razonablemente con Astro, TypeScript, CSS, Tailwind o APIs nativas.
6. No romper rutas con `base`, despliegues en raíz/subruta, i18n, SEO básico, accesibilidad ni tests existentes.
7. No eliminar tests para ocultar problemas: corregir el código o actualizar el test de forma robusta.
8. No duplicar lógica entre idiomas, páginas o componentes si puede centralizarse.
9. No crear ficheros grandes por comodidad; preferir piezas pequeñas con nombres claros.
10. Documentar cualquier convención nueva que afecte al uso del proyecto.

## Reglas obligatorias para crear issues

Cuando un agente IA cree issues en este repositorio, cada issue debe incluir siempre un prompt accionable para solucionarla.

Ese prompt debe cumplir estas condiciones:

- Hacer referencia explícita a este repositorio e incluir su URL.
- Explicar con claridad qué problema, mejora o tarea debe resolverse.
- Indicar que la solución debe respetar todas las condiciones de este `agents.md`.
- Indicar que se deben mantener ficheros pequeños, modularidad, i18n, accesibilidad, SEO, rendimiento y compatibilidad con dominio raíz, subrutas y GitHub Pages cuando aplique.
- Pedir que se actualicen tests y documentación cuando el cambio lo requiera.
- Evitar instrucciones ambiguas sin contexto suficiente.

Formato recomendado:

```md
## Prompt para resolver esta issue

Trabaja en este repositorio: [añade aquí la URL del repositorio].

Resuelve esta issue manteniendo todas las condiciones descritas en `agents.md`: ficheros lo más pequeños posible, código modular, soporte completo de idiomas/i18n, accesibilidad, SEO, rendimiento, compatibilidad con dominio raíz (`/`), subrutas (`/nombre-del-repositorio/`) y GitHub Pages cuando aplique, además de tests smoke útiles.

[Describe aquí la tarea concreta, el comportamiento esperado y los ficheros o zonas afectadas si se conocen.]

Actualiza tests y documentación si el cambio modifica comportamiento, arquitectura, i18n, rutas, estilos o convenciones del proyecto.
```

Toda issue creada por IA debe ser lo bastante clara como para que otro agente pueda resolverla sin pedir contexto adicional.

Si el usuario pide crear varias issues, cada issue debe ser independiente, accionable y resoluble por otro agente sin depender de contexto externo no incluido en la propia issue.

Si una tarea es grande, dividirla en varias issues o PRs pequeñas, cada una con un objetivo verificable.

## Reglas para trabajar con GitHub API

Cuando un agente IA trabaje con este repositorio mediante GitHub API, debe priorizar cambios pequeños, trazables y fáciles de revisar.

### Antes de modificar código

El agente debe:

1. Identificar la rama base correcta, normalmente `main`.
2. Revisar la estructura del repositorio antes de proponer cambios.
3. Leer los ficheros relevantes antes de editarlos.
4. Comprobar si ya existe una issue, PR o rama relacionada.
5. Evitar cambios masivos si la tarea puede resolverse con cambios pequeños.

### Ramas y pull requests

- Crear una rama nueva por cada tarea o grupo de tareas relacionadas.
- Usar nombres de rama descriptivos, por ejemplo `fix-i18n-smoke-tests`, `add-github-api-dashboard` o `improve-mobile-navigation`.
- No trabajar directamente sobre `main`, salvo que el usuario lo pida expresamente.
- Abrir una PR con resumen claro de cambios.
- La PR debe indicar qué se ha cambiado, por qué, qué ficheros principales se han tocado, cómo probarlo y si se han actualizado tests o documentación.

### Commits

- Hacer commits pequeños y coherentes.
- No mezclar cambios no relacionados en el mismo commit.
- Usar mensajes de commit claros, en imperativo y con contexto.
- Evitar commits genéricos como `fix`, `changes`, `update` o `wip`.

### Edición de ficheros

- Leer siempre el fichero actual antes de actualizarlo.
- No sobrescribir ficheros enteros si basta con un cambio localizado.
- Conservar estilo, estructura y convenciones existentes.
- Evitar reordenar código sin necesidad, porque dificulta revisar el diff.
- No borrar comentarios útiles, documentación o tests salvo que estén obsoletos y se justifique.

### Pull requests creadas mediante GitHub API

Toda PR creada por IA debe incluir:

```md
## Cambios

- [Cambio principal 1]
- [Cambio principal 2]

## Motivo

[Explica por qué se hizo el cambio.]

## Cómo probarlo

```sh
npm ci
npm test
npm run build
```

## Notas

[Indica limitaciones, decisiones técnicas o cosas no verificadas.]
```

### Búsquedas y contexto

Cuando el agente necesite entender el proyecto, debe buscar primero por:

- nombres de componentes,
- rutas,
- funciones,
- claves i18n,
- nombres de tests,
- configuración en `astro.config.mjs`,
- configuración en `src/config/site.ts`.

No debe asumir que un fichero existe sin comprobarlo.

### Seguridad

- No incluir tokens, secretos, claves API ni credenciales en commits, issues o PRs.
- No imprimir valores de variables de entorno sensibles.
- No crear ficheros `.env` reales; usar `.env.example` para documentación.
- No añadir permisos amplios a workflows de GitHub Actions si no son necesarios.
- No modificar configuración de despliegue sin explicar el impacto.

### Automatización y CI

- Si se toca código fuente, intentar mantener o actualizar tests.
- Si se toca i18n, comprobar que todos los JSON siguen alineados.
- Si se toca routing, comprobar compatibilidad con `base`, dominio raíz, subrutas y GitHub Pages.
- Si se toca UI, comprobar responsive, dark mode y accesibilidad básica.
- Si no se pueden ejecutar tests, indicarlo claramente en la PR.

### Criterio general

El objetivo de usar GitHub API no es solo cambiar ficheros, sino dejar un historial claro: issue entendible, rama concreta, commits pequeños, PR revisable y explicación suficiente para continuar el trabajo más tarde.

## Tamaño y modularidad de ficheros

Los ficheros deben mantenerse lo más pequeños posible sin sacrificar claridad.

Buenas prácticas obligatorias:

- Un fichero debe tener una responsabilidad principal.
- Extraer constantes compartidas a `src/config/`, `src/data/` o un módulo equivalente.
- Extraer helpers reutilizables a módulos propios.
- Extraer UI repetida a componentes de `src/components/`.
- Evitar duplicar bloques grandes de HTML, CSS o JavaScript.
- Evitar componentes con demasiada lógica interna.
- Mantener los estilos globales para tokens, resets y utilidades realmente globales.
- Mantener los estilos específicos cerca del componente cuando sea más claro.

Guía orientativa:

- Si un componente supera aproximadamente 200 líneas, valorar dividirlo.
- Si un helper mezcla varias responsabilidades, separarlo.
- Si una página contiene mucha UI repetible, mover esa UI a componentes.
- Si una lista de datos crece, moverla a un fichero de datos o configuración.

La prioridad es claridad, reutilización y mantenimiento.

## Idiomas e i18n obligatorio

Toda funcionalidad nueva debe generarse con soporte para todos los idiomas configurados.

Reglas obligatorias:

- La fuente de verdad de idiomas está en `src/config/site.ts`.
- Las traducciones viven en `src/i18n/translations/*.json`.
- No hardcodear textos visibles en componentes reutilizables.
- Usar `useTranslations(locale)` para textos de UI.
- Mantener todas las claves alineadas entre idiomas.
- Si se añade un locale a `locales`, debe añadirse su JSON de traducción.
- Si se añade un JSON de traducción, debe añadirse el locale correspondiente a `locales`.
- Las rutas internas deben generarse con helpers localizados cuando aplique.
- La home del idioma por defecto debe seguir funcionando en `/`.
- Los idiomas secundarios deben seguir funcionando en `/{locale}/`.

Cuando se añada una clave nueva:

1. Añadirla al JSON del idioma por defecto.
2. Añadirla a todos los demás JSON configurados.
3. Usarla mediante helpers de i18n.
4. Ejecutar o mantener tests que comprueben que las claves están alineadas.

## Estándares de calidad

Todo cambio debe cumplir estos estándares:

- Código claro, simple y fácil de revisar.
- Nombres descriptivos para componentes, funciones, constantes y ficheros.
- TypeScript estricto cuando aplique.
- Sin lógica duplicada innecesaria.
- Sin código muerto, comentarios obsoletos ni pruebas desactivadas sin motivo.
- Sin hacks frágiles si existe una solución estable.
- Sin dependencias pesadas para tareas simples.
- Sin JavaScript de cliente si Astro/HTML/CSS lo resuelve bien.
- Accesibilidad básica: labels, textos alternativos, foco visible, contraste y estructura semántica.
- SEO básico: títulos, descripciones, canonical cuando aplique, Open Graph y marcado correcto en layouts.
- Rendimiento: evitar assets pesados, scripts innecesarios y bloqueos de render.

## Arquitectura actual

La base del proyecto usa:

- Astro 6.
- Tailwind CSS 4 mediante `@tailwindcss/vite`.
- MDX.
- `@astrojs/sitemap`.
- i18n nativo de Astro.
- Traducciones en JSON por idioma.
- GitHub Actions para CI y GitHub Pages cuando aplique.
- Tests básicos con `node:test`.

## Estructura importante

- `astro.config.mjs`: configuración de Astro, `site`, `base`, i18n e integraciones.
- `src/config/site.ts`: configuración central del sitio e idiomas.
- `src/i18n/ui.ts`: helpers de traducción y rutas localizadas.
- `src/i18n/translations/*.json`: textos traducibles.
- `src/layouts/BaseLayout.astro`: HTML base, SEO, Open Graph, header y footer.
- `src/components/`: componentes reutilizables.
- `src/pages/index.astro`: home del idioma por defecto.
- `src/pages/[locale]/index.astro`: home de idiomas no predeterminados.
- `src/pages/robots.txt.ts`: robots dinámico.
- `src/pages/manifest.webmanifest.ts`: manifest dinámico.
- `.github/workflows/ci.yml`: checks en pull requests.
- `.github/workflows/pages.yml`: despliegue en GitHub Pages cuando aplique.
- `tests/smoke.test.mjs`: comprobaciones básicas.

## Reglas para modificar el proyecto

### No romper rutas, dominio raíz, subrutas ni GitHub Pages

El proyecto debe funcionar tanto si se aloja en la raíz de un dominio (`https://example.com/`) como si se aloja en una subruta (`https://example.com/proyecto/`, GitHub Pages u otro hosting similar).

No crear enlaces internos o assets con rutas absolutas duras tipo `/archivo.svg`, `/assets/...` o `/ruta/` si deben respetar `base` o funcionar dentro de una subcarpeta.

Usar helpers existentes cuando aplique:

- `getLocalizedPath('/', locale)` para URLs internas localizadas.
- `import.meta.env.BASE_URL` para assets y rutas que dependan del `base`.
- Utilidades centralizadas de rutas si existen en el proyecto.

Antes de terminar cualquier cambio que afecte a rutas, assets, navegación, manifest, robots, sitemap, canonical, Open Graph o enlaces internos, comprobar mentalmente ambos escenarios:

- dominio raíz: `base = '/'`.
- subruta: `base = '/nombre-del-repositorio/'`.

### No romper i18n

No meter textos visibles directamente en componentes o páginas si son parte de la UI reutilizable. Añadir claves a los JSON de traducciones.

Cuando se añada una clave nueva:

1. Añadirla en `src/i18n/translations/es.json` o en el JSON del idioma por defecto configurado.
2. Añadirla en todos los demás JSON de `src/i18n/translations/`.
3. Usarla con `useTranslations(locale)`.
4. Mantener las claves alineadas entre idiomas.

### No añadir dependencias sin necesidad

Evitar librerías nuevas salvo que la tarea lo requiera claramente. Preferir Astro, TypeScript, CSS, Tailwind y APIs del navegador.

### Mantener tests suaves

Los tests no deben validar detalles frágiles de diseño. Deben comprobar que el proyecto no explota y que los elementos base existen.

Cuando se añada infraestructura nueva, actualizar `tests/smoke.test.mjs` con comprobaciones mínimas y robustas.

Los tests de i18n no deben depender de una lista fija de idiomas si pueden leer la configuración real de `src/config/site.ts`.

### Mantener documentación actualizada

Si se cambia una convención importante, actualizar el documento correspondiente en `docs/` y, si afecta a agentes IA, también este archivo.

## Checklist antes de terminar una tarea

- ¿Se han aplicado las reglas de este `agents.md`?
- ¿Sigue funcionando el idioma por defecto en `/`?
- ¿Siguen funcionando los idiomas secundarios como `/en/` y cualquier otro locale configurado?
- ¿Las rutas internas funcionan tanto con `base = '/'` como con `base = '/nombre-del-repositorio/'`?
- ¿Los assets, enlaces, canonical, Open Graph, manifest, robots y sitemap respetan `base` cuando aplica?
- ¿Los textos nuevos están en todos los JSON de traducción?
- ¿Las claves de traducción siguen alineadas entre idiomas?
- ¿Los ficheros modificados siguen siendo pequeños y con una responsabilidad clara?
- ¿Se ha evitado duplicar lógica o UI?
- ¿El cambio respeta `docs/design-system.md` si existe?
- ¿El código cumple estándares de calidad, accesibilidad, SEO y rendimiento?
- ¿Se mantiene `npm test` como comprobación básica?
- ¿Se actualizó la documentación si cambió una convención?

## Comandos útiles

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
npm run clean
```

## Qué evitar

- Convertir el proyecto en algo difícil de reutilizar o mantener.
- Añadir frameworks de UI pesados sin necesidad.
- Duplicar layouts por idioma si se puede resolver con traducciones.
- Usar rutas absolutas que fallen en despliegues con subruta o GitHub Pages.
- Saltarse los JSON de traducción.
- Borrar tests smoke porque parezcan simples.
- Usar fuentes externas.
- Añadir JavaScript de cliente si no aporta valor real.
- Crear ficheros enormes con varias responsabilidades.
- Generar UI solo en un idioma.
- Crear issues sin prompt accionable para resolverlas.
- Ignorar este archivo por rapidez.

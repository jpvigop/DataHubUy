# UruData - Explorador de Datos Abiertos

UruData es una aplicación web que permite explorar y visualizar datos del Catálogo Nacional de Datos Abiertos de Uruguay.

## Características

- Exploración de datasets disponibles en el catálogo
- Visualización de datos en formato tabular
- Generación de gráficos a partir de los datos
- Filtrado y ordenamiento de datos
- Modo oscuro/claro
- Marcado de datasets favoritos

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Chart.js
- Axios

## Desarrollo

### Requisitos previos

- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/urudata.git
cd urudata

# Instalar dependencias
npm install
# o
yarn install

# Iniciar servidor de desarrollo
npm run dev
# o
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## API

La aplicación utiliza la API del Catálogo Nacional de Datos Abiertos:
- API principal: https://catalogodatos.gub.uy/api/3
- Endpoints principales:
  - datastore_create
  - datastore_upsert
  - datastore_search
  - datastore_search_sql

## Licencia

Este proyecto está bajo la Licencia MIT.

## Créditos

Datos obtenidos del [Catálogo Nacional de Datos Abiertos](https://catalogodatos.gub.uy), Ministerio de Economía y Finanzas, 2024. 
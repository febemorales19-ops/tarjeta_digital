# Prácticas Vue + PrimeVue

Contiene dos módulos: **Tarjeta Digital** (ruta `/tarjeta`) y **Punto de Venta** (ruta `/pos`).

## Tarjeta Digital de Empleado

Aplicación web hecha con **Vue 3 + PrimeVue** (plantilla Sakai-Vue) que genera el **RFC** de una persona
a partir de su nombre y fecha de nacimiento, y muestra su **tarjeta digital** con **código de barras**
(librería [JsBarcode](https://github.com/lindell/JsBarcode)).

## Cómo ejecutarlo en tu computadora

Requiere [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install      # instala las dependencias (solo la primera vez)
npm run dev      # abre http://localhost:5173
npm run build    # genera la carpeta dist/ para publicar
```

## Estructura importante

| Archivo | Para qué sirve |
|---|---|
| `src/views/PuntoVenta.vue` | Módulo de punto de venta: DataTable, registrar/editar/eliminar y totales |
| `src/views/TarjetaDigital.vue` | Pantalla principal: formulario + tarjeta + código de barras |
| `src/utils/rfc.js` | Lógica que calcula el RFC (4 letras + fecha + homoclave + verificador) |
| `src/router/index.js` | Rutas de la aplicación |
| `src/layout/AppMenu.vue` | Menú lateral |
| `vercel.json` | Configuración para publicar en Vercel (SPA) |

> El RFC oficial lo asigna el SAT. Este generador aplica el algoritmo público con fines académicos.

Plantilla base: [Sakai-Vue](https://github.com/primefaces/sakai-vue) (MIT).

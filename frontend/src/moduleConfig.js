/**
 * Configuración de redirección local para desarrollo
 * En desarrollo: redirige a localhost:PUERTO
 * En producción: redirige a URL de producción
 */

const isDevelopment = import.meta.env.MODE === 'development' || 
                      import.meta.env.DEV || 
                      window.location.hostname === 'localhost';

export const MODULE_URLS = isDevelopment ? {
  logistica: 'http://localhost:5160',
  rrhh: 'http://localhost:5161',
  produccion: 'http://localhost:5162',
  orden_pago: 'http://localhost:5163',
  flota: 'http://localhost:5164',
  portal: 'http://localhost:5173',
} : {
  logistica: import.meta.env.VITE_LOGISTICA_URL || 'https://modulologisticasomyl-production.up.railway.app',
  rrhh: import.meta.env.VITE_RRHH_URL || 'https://rrhhsomyl2026-production.up.railway.app',
  produccion: import.meta.env.VITE_PRODUCCION_URL || 'https://produccionsomyl2026-production.up.railway.app',
  orden_pago: import.meta.env.VITE_ORDEN_PAGO_URL || 'https://orden-pago-production.up.railway.app',
  flota: import.meta.env.VITE_FLOTA_URL || 'https://flota.datix.cl',
  portal: 'https://portal.datix.cl',
};

export const navigateToModule = (moduleName) => {
  const url = MODULE_URLS[moduleName];
  if (url) {
    window.location.href = url;
  } else {
    console.error(`Unknown module: ${moduleName}`);
  }
};

export const getBackToPortalUrl = () => {
  return MODULE_URLS.portal;
};

export const isDev = isDevelopment;

export default {
  MODULE_URLS,
  navigateToModule,
  getBackToPortalUrl,
  isDev,
};

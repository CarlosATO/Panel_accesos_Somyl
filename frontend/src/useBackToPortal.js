/**
 * Hook para regresar al Portal desde cualquier módulo
 * En desarrollo: http://localhost:5173
 * En producción: https://portal.datix.cl
 */

export const useBackToPortal = () => {
  const isDevelopment = window.location.hostname === 'localhost';
  
  const backToPortal = () => {
    const portalUrl = isDevelopment ? 'http://localhost:5173' : 'https://portal.datix.cl';
    window.location.href = portalUrl;
  };

  return { backToPortal };
};

export default useBackToPortal;

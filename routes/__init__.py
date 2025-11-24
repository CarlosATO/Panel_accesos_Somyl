"""
Módulo de rutas del Portal SSO
Contiene todos los blueprints organizados por funcionalidad
"""
from .usuarios import usuarios_bp
from .auth import auth_bp

__all__ = ['usuarios_bp', 'auth_bp']

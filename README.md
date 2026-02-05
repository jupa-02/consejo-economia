# Consejo de Economía - Universidad de Cartagena

Sitio web oficial del Consejo Estudiantil de Economía de la Universidad de Cartagena. Una plataforma diseñada por estudiantes para estudiantes, integrando herramientas académicas, información oficial indicadores económicos en tiempo real.

![Preview](./assets/images/hero-bg.jpg)

## 🚀 Características Principales

### 1. 📊 Ticker Económico en Vivo
Barra de indicadores financieros actualizada automáticamente:
- **TRM (Dólar)**: Conectado a la API de Datos Abiertos (Socrata).
- **Indicadores Macro**: IPC, Desempleo, PIB y Tasa BanRep (Datos oficiales verificados).
- **UVR**: Actualización diaria.

### 2. 🧮 Calculadora de Notas "Salvavidas"
Herramienta de proyección académica avanzada:
- **Pesos Personalizados**: Corte 1 (30%), Corte 2 (30%), Corte 3 (40%).
- **Meta Flexible**: Define tu nota objetivo (ej: 4.5) y la calculadora te dice qué necesitas.
- **Proyecciones**:
    - *Solo Corte 1*: Calcula el promedio necesario en el resto del semestre.
    - *Corte 1 + 2*: Calcula la nota exacta del Examen Final.

### 3. 🎓 Malla Curricular Interactiva
Visualización clara del plan de estudios 2025:
- Niveles I al IX.
- Créditos claramente identificados.
- Prerrequisitos y descripciones (Modal en desarrollo).

### 4. 🔍 Recursos Estudiantiles
- Acceso directo a **Base de Parciales** (Repositorio Drive).
- Rutas de Grado (Investigación, Coterminales, etc.).
- Formulario de PQRS y Experiencias.

## 🛠️ Tecnologías

*   **Frontend**: HTML5, CSS3 (Variables, Flexbox, Grid), JavaScript (Vanilla).
*   **Diseño**: Estilo "Economist" (Dark Blue & Gold), Glassmorphism, Responsive Design.
*   **Automatización**: Python + GitHub Actions (para actualización semanal de indicadores estáticos).
*   **Iconos**: FontAwesome.

## ⚙️ Instalación Local

1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/jupa-02/consejo-economia.git
    ```
2.  Abrir `index.html` en tu navegador.

## 🤖 Automatización

El archivo `.github/workflows/update_indicators.yml` ejecuta semanalmente el script `scripts/update_stats.py` para consultar la API de Datos Abiertos y mantener la TRM y otros datos frescos en el HTML estático.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
**Desarrollado para el CEE - Unicartagena 2026**

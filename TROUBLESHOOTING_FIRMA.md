# Solución de Problemas - Firma en PDF

## Problema: La firma a veces aparece y otras veces no en el PDF

### Cambios Implementados

Se han implementado las siguientes mejoras para resolver el problema de la firma inconsistente:

#### 1. Validación Mejorada de Firma
- **Detección de firmas vacías**: El sistema ahora detecta automáticamente si una firma está vacía o es inválida
- **Validación de formato**: Se verifica que la cadena base64 sea válida antes de procesarla
- **Detección de imagen por defecto**: Se identifica y omite la imagen vacía por defecto de SignaturePad

#### 2. Manejo Robusto de Errores
- **Reintentos automáticos**: Si falla la carga de la imagen, el sistema reintenta hasta 3 veces con backoff exponencial
- **Validación de imagen**: Se verifica que la imagen se pueda cargar correctamente antes de agregarla al PDF
- **Soporte para múltiples formatos**: Intenta cargar como PNG primero, y si falla, como JPEG

#### 3. Logging Mejorado
- **Diagnóstico detallado**: Se agregan logs para rastrear el proceso de carga y procesamiento de la firma
- **Información de depuración**: Se muestra información sobre el tamaño y formato de la firma

### Cómo Verificar que Funciona

1. **Abrir la consola del navegador** (F12 → Console)
2. **Crear una firma** en el Step 1
3. **Ir al Step 5** para generar el PDF
4. **Revisar los logs** en la consola:
   - Debe mostrar "Datos del usuario cargados" con información de la firma
   - Debe mostrar "Procesando firma" cuando se procese
   - Debe mostrar "Firma agregada exitosamente al PDF" si todo va bien

### Posibles Mensajes de Error y Soluciones

#### "Firma detectada como vacía, omitiendo..."
- **Causa**: La firma no tiene contenido real
- **Solución**: Asegúrate de dibujar una firma real en el canvas antes de continuar

#### "Error al cargar imagen"
- **Causa**: Problema con el formato de la imagen o datos corruptos
- **Solución**: Limpia la firma y vuelve a dibujarla

#### "Falló después de 3 intentos"
- **Causa**: Problema de red o datos de imagen inválidos
- **Solución**: Recarga la página y vuelve a intentar

### Diagnóstico Manual

Si el problema persiste, puedes verificar manualmente:

1. **En la consola del navegador**, ejecuta:
   ```javascript
   localStorage.getItem('wizard_user_data')
   ```

2. **Busca el campo `signature`** en el resultado

3. **Verifica que**:
   - No esté vacío
   - Comience con `data:image/png;base64,`
   - Tenga una longitud considerable (más de 1000 caracteres para una firma real)

### Prevención de Problemas

- **Dibuja firmas claras**: Asegúrate de que la firma tenga suficiente contenido
- **Evita firmas muy pequeñas**: Las firmas de un solo punto pueden ser detectadas como vacías
- **No uses caracteres especiales**: Mantén la firma como un dibujo simple

### Contacto

Si el problema persiste después de estos cambios, proporciona:
1. Los logs de la consola del navegador
2. El navegador y versión que estás usando
3. Los pasos exactos para reproducir el problema
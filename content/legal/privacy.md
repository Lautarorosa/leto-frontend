Status: Official  
Version: V1.1  
Owner: LETO  
Section: Compliance  
Last Updated: June 2026

# Política de Privacidad

**LETO · Última actualización: Junio de 2026 · Versión 1.1**

## Contenido

1. Quiénes somos
    
2. Qué datos tratamos
    
3. Cómo usamos los datos
    
4. Bases jurídicas del tratamiento
    
5. Roles y responsabilidades sobre los datos
    
6. Con quién compartimos datos
    
7. Proveedores y subprocesadores
    
8. Retención y eliminación de datos
    
9. Derechos de los titulares
    
10. Transferencias internacionales
    
11. Seguridad
    
12. Cambios a esta política
    
13. Contacto
    

---

## 1. Quiénes somos

LETO, en adelante “LETO”, “nosotros” o “el servicio”, es una plataforma SaaS de inteligencia operacional para comercios electrónicos, operada desde Uruguay.

LETO se integra inicialmente con TiendaNube para sincronizar datos operacionales autorizados por el comerciante y generar análisis de márgenes, alertas, recomendaciones, simulaciones e información destinada a apoyar decisiones comerciales.

LETO no es un sistema contable, ERP, CRM ni una plataforma de marketing. Tampoco ejecuta acciones comerciales sobre la tienda sin autorización, consentimiento o configuración explícita del comerciante.

Esta Política de Privacidad explica qué datos tratamos, con qué finalidades, durante cuánto tiempo podemos conservarlos, con quién podemos compartirlos y qué derechos pueden ejercer sus titulares.

---

## 2. Qué datos tratamos

LETO aplica un principio de minimización y procura tratar únicamente los datos necesarios para operar, proteger y mejorar la prestación del servicio.

Las categorías concretas de datos tratadas pueden depender de los permisos concedidos por el comerciante, de la configuración de la integración y de las funcionalidades utilizadas.

### 2.1. Datos del comerciante y de la tienda

Podemos tratar:

- Nombre y datos identificativos de la tienda.
    
- Dirección de correo electrónico y otros datos de contacto asociados a la cuenta o recibidos desde la plataforma integrada.
    
- Identificadores internos de la tienda y de la integración.
    
- Identificadores proporcionados por TiendaNube u otra plataforma autorizada.
    
- Estado de instalación, conexión y sincronización.
    
- Configuraciones operativas introducidas en LETO.
    
- Información necesaria para administrar la sesión del comerciante.
    
- Preferencias y parámetros utilizados para prestar el servicio.
    

### 2.2. Credenciales e información de integración

Para conectar LETO con TiendaNube podemos tratar:

- Tokens de acceso y otras credenciales técnicas proporcionadas mediante el flujo de autorización de la plataforma.
    
- Identificadores de la aplicación, tienda e instalación.
    
- Permisos autorizados.
    
- Estado de conexión.
    
- Metadata técnica de la integración.
    
- Información relacionada con webhooks, sincronizaciones y eventos recibidos.
    

Los tokens de acceso almacenados por LETO deben protegerse mediante mecanismos de cifrado y no deben exponerse al Frontend ni conservarse deliberadamente en texto plano.

### 2.3. Datos operacionales de ecommerce

Según los permisos y funcionalidades habilitadas, LETO puede acceder y almacenar datos como:

- Productos y variantes.
    
- Nombre, descripción, SKU y otros identificadores de producto.
    
- Precios de venta.
    
- Stock e información de inventario.
    
- Categorías y metadata comercial.
    
- Órdenes, montos, fechas, estados e identificadores operacionales.
    
- Información necesaria para relacionar productos, variantes, órdenes y ventas.
    
- Timestamps y estados de sincronización.
    
- Eventos operacionales recibidos desde la plataforma integrada.
    

Los costos, comisiones, fees, umbrales y otros parámetros económicos configurados directamente por el comerciante en LETO son datos propios del servicio y no deben presumirse como obtenidos desde TiendaNube.

### 2.4. Resultados generados por LETO

LETO puede generar y conservar resultados derivados de los datos operacionales y de la configuración del comerciante, incluyendo:

- Márgenes calculados.
    
- Estados de riesgo.
    
- Alertas operacionales.
    
- Insights y recomendaciones.
    
- Simulaciones de impacto.
    
- Estados de calidad o validez de los resultados.
    
- Metadata necesaria para trazabilidad y reproducibilidad.
    

Estos resultados son producidos por LETO y no constituyen necesariamente información proporcionada directamente por la plataforma integrada.

### 2.5. Datos de consumidores finales

Dependiendo del alcance autorizado por el comerciante y de los datos incluidos en órdenes, clientes, eventos o respuestas de la plataforma integrada, LETO puede recibir datos personales de consumidores finales, tales como:

- Identificadores de cliente.
    
- Nombre.
    
- Dirección de correo electrónico.
    
- Número de teléfono.
    
- Dirección de entrega o facturación.
    
- Información asociada a órdenes y compras.
    
- Otros datos incluidos por la plataforma integrada en los recursos necesarios para prestar el servicio.
    

LETO procura limitar el uso de estos datos a lo estrictamente necesario para la operación, sincronización, seguridad, cumplimiento normativo e inteligencia operacional prestada al comerciante.

LETO no está diseñado para recopilar ni necesita acceder a:

- Números completos de tarjetas de crédito o débito.
    
- Códigos de seguridad de tarjetas.
    
- Contraseñas personales de consumidores.
    
- Credenciales bancarias completas.
    
- Datos destinados a autenticar pagos.
    
- Categorías sensibles de datos personales que no sean necesarias para prestar el servicio.
    

Cuando información no necesaria sea recibida incidentalmente desde una plataforma integrada, LETO procurará limitar su conservación y tratamiento conforme a sus obligaciones aplicables.

### 2.6. Datos técnicos, de sesión y seguridad

Podemos tratar:

- Dirección IP.
    
- Fecha y hora de acceso.
    
- Información básica del navegador y dispositivo.
    
- Registros de autenticación y sesión.
    
- Identificadores técnicos y de correlación.
    
- Cookies necesarias para mantener una sesión autenticada.
    
- Logs del Backend, Frontend, base de datos, workers e infraestructura.
    
- Errores, fallas y eventos de seguridad.
    
- Registros de webhooks y procesamiento asíncrono.
    
- Datos necesarios para prevenir abuso, investigar incidentes y mantener la integridad del servicio.
    

LETO utiliza una sesión propia basada en un token JWT firmado por el Backend y almacenado en una cookie configurada como HttpOnly. LETO no utiliza Supabase Auth.

### 2.7. Registros de compliance y auditoría

Podemos conservar información relacionada con:

- Solicitudes de acceso, eliminación o reporte de datos.
    
- Validación y alcance de dichas solicitudes.
    
- Estado de procesamiento.
    
- Identificadores de idempotencia.
    
- Datos o entidades afectados.
    
- Resultado de la operación.
    
- Evidencia técnica necesaria para demostrar el cumplimiento de la solicitud.
    

---

## 3. Cómo usamos los datos

LETO puede utilizar los datos tratados para:

- Instalar, autenticar y mantener la integración con TiendaNube.
    
- Identificar la tienda y mantener la sesión del comerciante.
    
- Sincronizar productos, variantes, precios, stock, órdenes y otros datos autorizados.
    
- Mantener una representación interna del catálogo y de las operaciones de la tienda.
    
- Procesar costos y parámetros económicos proporcionados por el comerciante.
    
- Calcular márgenes y otros indicadores operacionales.
    
- Detectar riesgos, inconsistencias y problemas operacionales.
    
- Generar alertas, insights, recomendaciones y simulaciones.
    
- Presentar información en el dashboard.
    
- Mantener la seguridad, integridad y disponibilidad del servicio.
    
- Procesar webhooks, callbacks y tareas en segundo plano.
    
- Detectar, investigar y corregir errores o incidentes.
    
- Prevenir accesos no autorizados, fraude, abuso o uso indebido.
    
- Mantener registros técnicos y de auditoría.
    
- Atender solicitudes de titulares de datos.
    
- Cumplir obligaciones legales, regulatorias y contractuales.
    
- Cumplir los requerimientos técnicos y de privacidad de TiendaNube.
    
- Proteger los derechos de LETO, sus usuarios y terceros.
    

LETO no vende datos personales.

LETO no utiliza datos del comerciante o de consumidores finales para publicidad de terceros ni para construir perfiles publicitarios destinados a terceros.

LETO no utiliza estos datos para entrenar modelos generales de inteligencia artificial.

Los resultados generados por LETO tienen una finalidad informativa y operacional. El comerciante conserva el control sobre sus decisiones comerciales y sobre las acciones realizadas en su tienda.

---

## 4. Bases jurídicas del tratamiento

Las bases jurídicas aplicables pueden variar según la relación de LETO con el titular, la jurisdicción aplicable y la finalidad concreta del tratamiento.

LETO puede basar el tratamiento en:

|Base jurídica|Aplicación|
|---|---|
|Ejecución de una relación contractual|Tratamientos necesarios para instalar, operar y prestar el servicio solicitado por el comerciante|
|Cumplimiento de obligaciones legales|Atención de derechos, conservación de evidencia, respuesta a autoridades y cumplimiento de normas aplicables|
|Interés legítimo|Seguridad, prevención de fraude y abuso, integridad, observabilidad, auditoría y defensa de derechos, cuando dicho interés no prevalezca sobre los derechos del titular|
|Consentimiento|Tratamientos que requieran autorización expresa conforme a la normativa aplicable|
|Instrucciones del comerciante|Tratamiento de datos de consumidores finales realizado por LETO para prestar el servicio al comerciante, dentro del alcance autorizado|

Cuando el consentimiento sea la base aplicable, el titular podrá retirarlo conforme a la normativa correspondiente, sin afectar la licitud del tratamiento realizado previamente.

---

## 5. Roles y responsabilidades sobre los datos

### 5.1. Datos del comerciante y uso directo de LETO

Respecto de los datos necesarios para administrar la cuenta, autenticar al comerciante, proteger el servicio, gestionar la relación contractual y cumplir obligaciones propias, LETO podrá actuar como responsable del tratamiento conforme a la normativa aplicable.

### 5.2. Datos procedentes de la tienda

Respecto de los datos personales que el comerciante administra a través de su tienda y que LETO trata para prestar el servicio, el comerciante generalmente determina las finalidades y medios principales del tratamiento.

En esos casos, el comerciante actúa como responsable o controlador y LETO actúa como encargado, operador o procesador, según la terminología de la normativa aplicable.

El comerciante es responsable de:

- Contar con una base jurídica válida para tratar los datos.
    
- Informar adecuadamente a sus clientes y demás titulares.
    
- Obtener los consentimientos que correspondan.
    
- Configurar permisos e integraciones de forma adecuada.
    
- No utilizar LETO para tratar datos ilícitos, innecesarios o ajenos a la finalidad del servicio.
    
- Comunicar a LETO las instrucciones necesarias para responder a solicitudes válidas de consumidores finales.
    

LETO tratará esos datos dentro del alcance necesario para prestar el servicio, cumplir instrucciones válidas del comerciante y satisfacer obligaciones legales o de la plataforma integrada.

---

## 6. Con quién compartimos datos

LETO no vende ni alquila datos personales.

Los datos pueden comunicarse o ponerse a disposición de terceros únicamente cuando resulte necesario para alguna de las siguientes finalidades:

- Operar la infraestructura técnica del servicio.
    
- Alojar el Frontend, Backend, base de datos, colas y workers.
    
- Mantener la integración con TiendaNube.
    
- Procesar solicitudes válidas del comerciante o de titulares.
    
- Detectar o responder a incidentes de seguridad.
    
- Cumplir obligaciones legales o requerimientos de autoridades competentes.
    
- Proteger los derechos, seguridad e integridad de LETO, sus usuarios o terceros.
    
- Ejecutar una reorganización, adquisición, financiación o transferencia empresarial, sujeta a las garantías legales correspondientes.
    

TiendaNube no se considera automáticamente un subprocesador de LETO. Es la plataforma externa con la que el comerciante decide integrar el servicio y puede actuar bajo sus propios términos, políticas y responsabilidades.

LETO no comunica nuevamente a TiendaNube datos que no sean necesarios para ejecutar una solicitud autorizada, mantener la integración o cumplir una obligación aplicable.

---

## 7. Proveedores y subprocesadores

LETO utiliza proveedores técnicos para operar el servicio.

|Proveedor|Función principal|Datos que puede procesar|
|---|---|---|
|Railway|Hosting del Backend FastAPI, Railway PostgreSQL, Redis, workers Celery y demás infraestructura de Backend|Datos de cuenta, integración, catálogo, operaciones, resultados, logs, registros de compliance y otros datos almacenados o procesados por el Backend|
|Vercel|Hosting y distribución del Frontend Next.js|Datos técnicos de acceso, solicitudes al Frontend, dirección IP, información del navegador y otros datos procesados al servir la aplicación|

La ubicación efectiva del procesamiento puede depender de la infraestructura, regiones, servicios auxiliares y proveedores utilizados por cada proveedor.

Supabase, Supabase Auth y Netlify no forman parte de la infraestructura activa de producción de LETO y, por lo tanto, no se presentan como subprocesadores actuales.

GitHub se utiliza para control de versiones y procesos de desarrollo. LETO no debe almacenar deliberadamente datos personales de producción, tokens de acceso, secretos o bases de datos de clientes en repositorios de código. En caso de que un servicio de desarrollo llegue a procesar datos personales de producción, su función deberá evaluarse y documentarse antes de dicho tratamiento.

LETO podrá incorporar, sustituir o retirar proveedores cuando resulte necesario. La lista será actualizada cuando un cambio modifique de manera relevante el tratamiento de datos personales.

---

## 8. Retención y eliminación de datos

LETO conserva los datos únicamente durante el tiempo razonablemente necesario para:

- Prestar el servicio.
    
- Mantener activa la integración.
    
- Cumplir las finalidades descritas en esta política.
    
- Atender solicitudes de titulares.
    
- Resolver disputas.
    
- Investigar incidentes.
    
- Cumplir obligaciones legales o contractuales.
    
- Mantener evidencia técnica y de auditoría cuando exista una justificación válida.
    

Los períodos concretos pueden variar según la categoría de datos y el motivo de conservación.

### 8.1. Cuenta o integración activa

Mientras la cuenta o integración permanezca activa, LETO puede conservar los datos necesarios para operar el servicio, mantener la sincronización, presentar resultados y preservar la trazabilidad de las operaciones.

### 8.2. Desinstalación o cancelación

La desinstalación de la aplicación, desconexión de TiendaNube o cancelación del servicio puede iniciar procesos de revocación, desvinculación o eliminación de datos.

La desinstalación no implica necesariamente la eliminación instantánea de todos los registros, ya que algunos datos pueden requerir:

- Procesamiento técnico posterior.
    
- Validación del alcance de la solicitud.
    
- Conservación temporal por seguridad.
    
- Cumplimiento de obligaciones legales.
    
- Resolución de pagos o disputas.
    
- Preservación limitada de evidencia de compliance.
    

Cuando no exista una razón válida para conservarlos, los datos serán eliminados, anonimizados o desvinculados conforme al procedimiento aplicable.

### 8.3. Datos de consumidores finales

Los datos de consumidores finales serán eliminados, anonimizados o reportados cuando corresponda en respuesta a solicitudes válidas recibidas directamente o a través de TiendaNube.

### 8.4. Logs y registros de auditoría

Los logs y registros de auditoría pueden conservarse durante un período diferente al de los datos operacionales cuando sean necesarios para:

- Seguridad.
    
- Investigación de incidentes.
    
- Prevención de fraude.
    
- Integridad operacional.
    
- Cumplimiento legal.
    
- Evidencia de solicitudes de privacidad.
    

La conservación de dichos registros se limitará a la información y al período razonablemente necesarios para esas finalidades.

### 8.5. Copias de respaldo

Cuando existan copias de respaldo, la eliminación de datos de los sistemas activos puede no producir su desaparición inmediata de todas las copias.

Los datos contenidos en respaldos quedarán sujetos a los ciclos de retención y sobrescritura aplicables y no deberán restaurarse para uso ordinario después de una solicitud válida de eliminación, salvo cuando sea necesario por seguridad, recuperación ante incidentes o cumplimiento legal.

---

## 9. Derechos de los titulares

Dependiendo de la normativa aplicable, los titulares pueden solicitar:

- Acceso a sus datos personales.
    
- Confirmación de la existencia de tratamiento.
    
- Rectificación, actualización o corrección.
    
- Inclusión de información cuando corresponda.
    
- Eliminación o supresión.
    
- Anonimización o bloqueo de datos innecesarios o tratados irregularmente.
    
- Oposición a determinados tratamientos.
    
- Restricción del tratamiento.
    
- Portabilidad, cuando esté reconocida y resulte técnicamente aplicable.
    
- Información sobre las categorías de destinatarios.
    
- Revisión de tratamientos automatizados, cuando legalmente corresponda.
    
- Retiro del consentimiento cuando el tratamiento se base en este.
    

El ejercicio de un derecho puede estar sujeto a:

- Verificación razonable de identidad.
    
- Validación de la relación entre el solicitante, la tienda y los datos.
    
- Limitaciones previstas por la ley.
    
- Conservación necesaria para cumplir obligaciones legales o defender derechos.
    
- Instrucciones del comerciante cuando LETO actúe como encargado o procesador.
    

Cuando LETO trate datos de consumidores finales por cuenta de un comerciante, podrá remitir la solicitud al comerciante o coordinar con este la respuesta correspondiente.

### Solicitudes recibidas desde TiendaNube

LETO mantiene o debe mantener mecanismos técnicos para atender los eventos de privacidad requeridos por TiendaNube, incluyendo:

- Solicitudes de eliminación de datos de la tienda.
    
- Solicitudes de eliminación de datos de consumidores.
    
- Solicitudes de reporte de datos de consumidores.
    

Estos mecanismos corresponden a callbacks o webhooks técnicos entre TiendaNube y LETO. No sustituyen el canal de contacto directo indicado en la sección 13.

Para ejercer derechos directamente ante LETO, el titular puede utilizar el correo de contacto indicado al final de esta política.

---

## 10. Transferencias internacionales

LETO opera desde Uruguay y utiliza proveedores de infraestructura que pueden almacenar o procesar datos en otros países, incluyendo Estados Unidos, o mediante infraestructura distribuida internacionalmente.

Como consecuencia, los datos personales pueden ser transferidos o accedidos desde jurisdicciones distintas de aquella en la que se encuentra el comerciante o el titular.

Cuando corresponda, LETO procurará que estas transferencias se realicen mediante mecanismos jurídicos y contractuales reconocidos por la normativa aplicable, tales como:

- Decisiones o reconocimientos de adecuación.
    
- Cláusulas contractuales aplicables.
    
- Garantías contractuales equivalentes.
    
- Consentimiento válido, cuando corresponda.
    
- Necesidad contractual.
    
- Cumplimiento de una obligación legal.
    
- Otros mecanismos permitidos por la legislación aplicable.
    

La utilización de un proveedor extranjero o la aceptación de su política de privacidad no constituye por sí sola una garantía suficiente de cumplimiento de todas las normas sobre transferencias internacionales.

Cuando resulte aplicable la Lei Geral de Proteção de Dados de Brasil, LETO y el comerciante deberán considerar los requisitos legales y regulatorios correspondientes a las transferencias internacionales de datos personales.

---

## 11. Seguridad

LETO adopta medidas técnicas y organizativas orientadas a proteger la confidencialidad, integridad y disponibilidad de los datos.

Estas medidas incluyen, según corresponda:

- Uso de HTTPS para la transmisión de información entre los componentes públicos del servicio.
    
- Protección de tokens de acceso almacenados mediante mecanismos de cifrado.
    
- Gestión separada de secretos de infraestructura.
    
- Autenticación propia mediante tokens JWT firmados por el Backend.
    
- Almacenamiento del token de sesión en una cookie HttpOnly.
    
- Validación de la sesión antes de acceder a datos del comerciante.
    
- Aislamiento lógico de los datos mediante el identificador de tienda.
    
- Aplicación obligatoria del `store_id` en las operaciones que acceden a datos de una tienda.
    
- Procesamiento asíncrono mediante Redis y Celery.
    
- Validación de autenticidad de eventos externos cuando la plataforma proporcione un mecanismo verificable.
    
- Controles de idempotencia para reducir el riesgo de procesamiento duplicado.
    
- Logs técnicos y registros de auditoría.
    
- Restricción del acceso interno conforme a la función y necesidad.
    
- Revisión y actualización de controles ante cambios relevantes en la arquitectura.
    

La base de datos activa de LETO es PostgreSQL administrado en Railway.

LETO no utiliza actualmente Row Level Security como barrera automática de aislamiento en la base de datos. El aislamiento vigente depende principalmente de la autenticación, autorización y aplicación correcta del `store_id` por el Backend y los procesos asíncronos.

La ausencia de RLS no elimina la obligación de aislamiento, pero hace especialmente importantes la revisión de consultas, las pruebas, la validación de tenant y los controles de aplicación.

Algunos mecanismos de seguridad y compliance se encuentran sujetos a validación técnica continua. La descripción de una medida en esta política no debe interpretarse como una garantía absoluta de que ningún incidente pueda ocurrir.

Ningún sistema conectado a Internet es completamente invulnerable.

Cuando LETO confirme un incidente de seguridad que afecte datos personales, evaluará su alcance y realizará las comunicaciones requeridas a titulares, comerciantes, plataformas o autoridades dentro de los plazos establecidos por la normativa aplicable.

---

## 12. Cambios a esta política

LETO puede actualizar esta Política de Privacidad para reflejar:

- Cambios en el servicio.
    
- Cambios en los datos tratados o sus finalidades.
    
- Cambios en la infraestructura.
    
- Incorporación o sustitución de proveedores.
    
- Cambios en la legislación aplicable.
    
- Nuevos requerimientos de TiendaNube.
    
- Cambios materiales en los controles de seguridad o compliance.
    

La fecha y versión vigentes se indicarán al inicio del documento.

Cuando una modificación sea material, LETO procurará comunicarla mediante el servicio, correo electrónico u otro canal razonable antes de que entre en vigor, cuando resulte posible o legalmente necesario.

La versión vigente estará disponible en el dominio o URL oficial utilizado por LETO para publicar su documentación legal.

No debe considerarse vigente una copia publicada únicamente en una antigua URL de Netlify.

---

## 13. Contacto

**LETO — Consultas de privacidad y protección de datos**

Correo electrónico: **[letocorp.uy@gmail.com](mailto:letocorp.uy@gmail.com)**

Las solicitudes deberán incluir información suficiente para identificar al solicitante, localizar los datos correspondientes y verificar razonablemente su legitimación.

LETO responderá dentro de los plazos establecidos por la normativa aplicable o, cuando no exista un plazo específico, dentro de un período razonable.
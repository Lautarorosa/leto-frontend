Status: Official  
Version: V1.1  
Owner: LETO  
Section: Legal — Policies  
Last Updated: June 2026

# Política de Eliminación de Datos

**LETO · Versión 1.1 · Junio de 2026 · Jurisdicción: Uruguay**

## Contenido

1. Introducción y alcance
    
2. Principios aplicables a la eliminación
    
3. Eliminación de datos de una tienda
    
4. Desinstalación y desconexión de TiendaNube
    
5. Solicitudes relativas a consumidores finales
    
6. Mecanismos técnicos de privacidad de TiendaNube
    
7. Alcance de una eliminación
    
8. Excepciones y conservación limitada
    
9. Registros de compliance, seguridad y auditoría
    
10. Copias de respaldo e infraestructura de terceros
    
11. Plazos, verificación y estado de las solicitudes
    
12. Contacto y actualizaciones
    

---

## 1. Introducción y alcance

Esta Política de Eliminación de Datos, en adelante la “Política”, describe cómo LETO gestiona las solicitudes de eliminación, acceso, reporte, anonimización, desvinculación y retiro de datos relacionadas con:

- Comerciantes que utilizan LETO.
    
- Tiendas integradas con LETO.
    
- Consumidores finales cuyos datos puedan encontrarse asociados a órdenes u otros registros procesados por LETO.
    
- Solicitudes recibidas directamente.
    
- Solicitudes recibidas a través de TiendaNube.
    
- Desinstalaciones y revocaciones de integraciones.
    

Esta Política forma parte del marco legal de LETO y debe leerse junto con:

- La Política de Privacidad.
    
- Los Términos de Servicio.
    
- El Data Processing Agreement, cuando corresponda.
    
- Las condiciones y requerimientos de las plataformas integradas.
    
- La normativa de protección de datos aplicable.
    

LETO opera desde Uruguay y se integra inicialmente con TiendaNube.

Los mecanismos descritos en esta Política están destinados a permitir que LETO atienda sus obligaciones como responsable del tratamiento respecto de ciertos datos propios y como encargado, operador o procesador respecto de datos tratados por cuenta del comerciante.

La eliminación de datos no siempre implica su desaparición instantánea de todos los sistemas. Dependiendo del tipo de dato, la solicitud, la infraestructura y las obligaciones aplicables, el proceso puede comprender:

- Eliminación definitiva.
    
- Anonimización.
    
- Desvinculación de identificadores.
    
- Revocación de credenciales.
    
- Bloqueo del tratamiento ordinario.
    
- Marcado como pendiente de eliminación.
    
- Expiración mediante ciclos de retención.
    
- Conservación restringida por una excepción legítima.
    

---

## 2. Principios aplicables a la eliminación

LETO aplica los siguientes principios al procesar solicitudes de eliminación:

### 2.1. Verificación

Antes de eliminar o divulgar datos, LETO puede verificar razonablemente:

- La identidad del solicitante.
    
- La autoridad de quien representa a una tienda.
    
- La relación entre el solicitante y los datos.
    
- El identificador de la tienda involucrada.
    
- La autenticidad de una solicitud recibida desde una plataforma integrada.
    
- La legitimidad y alcance de la solicitud.
    

LETO no procesará una solicitud cuando no pueda confirmar razonablemente que corresponde a la tienda, cuenta o titular indicados.

### 2.2. Alcance limitado

La eliminación se aplicará únicamente a:

- La tienda correcta.
    
- El consumidor correcto.
    
- Las categorías de datos comprendidas en la solicitud.
    
- Los sistemas y registros sobre los que LETO posea control o capacidad razonable de actuación.
    

Toda operación relacionada con una tienda debe permanecer limitada por el identificador interno correspondiente, incluido el `store_id` utilizado por LETO.

### 2.3. Minimización

LETO procurará no conservar datos personales que ya no sean necesarios para:

- Prestar el Servicio.
    
- Cumplir una obligación legal.
    
- Mantener seguridad e integridad.
    
- Resolver disputas.
    
- Demostrar el cumplimiento de una solicitud.
    
- Proteger derechos legítimos.
    

### 2.4. Trazabilidad

Las solicitudes relevantes pueden generar un registro limitado que permita demostrar:

- Qué solicitud fue recibida.
    
- Cuándo fue recibida.
    
- Cómo fue validada.
    
- Qué tienda o titular estuvo involucrado.
    
- Qué acción fue ejecutada.
    
- Cuál fue su resultado.
    
- Si existió alguna excepción de conservación.
    

El registro de cumplimiento no debe utilizarse para reconstruir o continuar el uso ordinario de datos eliminados.

### 2.5. Idempotencia

Cuando sea técnicamente aplicable, LETO procura que el procesamiento repetido de una misma solicitud no genere:

- Eliminaciones inconsistentes.
    
- Recreación de información.
    
- Procesamiento duplicado no controlado.
    
- Estados contradictorios.
    
- Acciones sobre una tienda o consumidor diferente.
    

### 2.6. Seguridad

Las solicitudes se procesarán mediante mecanismos razonables de autenticación, validación, aislamiento y control de acceso.

Ninguna solicitud enviada por correo electrónico o por un canal no autenticado autoriza automáticamente la eliminación de datos sin las verificaciones correspondientes.

---

## 3. Eliminación de datos de una tienda

Un comerciante puede solicitar la eliminación de los datos asociados a su tienda mediante:

- Desinstalación de LETO desde TiendaNube.
    
- Revocación de la integración.
    
- Cancelación del Servicio.
    
- Solicitud directa enviada a LETO.
    
- Otro mecanismo oficial habilitado por la Plataforma.
    

La cancelación de una suscripción y la eliminación de datos son procesos relacionados, pero no necesariamente idénticos.

La cancelación puede detener cobros o acceso futuro sin producir inmediatamente la eliminación completa de todos los datos.

### 3.1. Datos comprendidos

Cuando corresponda una eliminación completa de tienda, el proceso puede comprender:

- Identificadores internos de la tienda.
    
- Nombre y metadata de la tienda.
    
- Datos de contacto asociados a la cuenta.
    
- Estado de instalación e integración.
    
- Tokens de acceso y credenciales técnicas almacenadas.
    
- Productos y variantes sincronizados.
    
- Precios y datos de stock.
    
- Categorías y metadata de catálogo.
    
- Órdenes y datos operacionales asociados.
    
- Costos ingresados por el comerciante.
    
- Comisiones, fees, umbrales y parámetros configurados.
    
- Márgenes calculados.
    
- Estados de riesgo.
    
- Alertas.
    
- Insights.
    
- Recomendaciones.
    
- Simulaciones persistidas.
    
- Preferencias y configuraciones del Servicio.
    
- Estados de sincronización.
    
- Eventos operacionales vinculados con la tienda.
    
- Registros de compliance que no deban conservarse por una excepción válida.
    

### 3.2. Credenciales de integración

Ante una desinstalación o solicitud válida, LETO deberá:

- Dejar de utilizar las credenciales revocadas para nuevos accesos.
    
- Revocar, invalidar, eliminar o inutilizar los tokens almacenados cuando corresponda.
    
- Detener futuras sincronizaciones.
    
- Evitar nuevos accesos no autorizados a la tienda.
    
- Invalidar sesiones vinculadas cuando resulte necesario.
    

La revocación efectiva también puede depender de los mecanismos ofrecidos por TiendaNube.

### 3.3. Datos derivados

La eliminación de los datos de entrada de una tienda puede requerir también eliminar o desvincular resultados derivados, incluyendo:

- Márgenes.
    
- Alertas.
    
- Recomendaciones.
    
- Simulaciones.
    
- Estados de riesgo.
    
- Métricas operacionales.
    
- Otros resultados generados por el Motor de Inteligencia.
    

LETO no deberá conservar resultados que permitan reconstruir información personal o comercial eliminada, salvo que exista una excepción válida de conservación.

### 3.4. Datos compartidos o relacionados

Cuando un registro técnico se relacione con más de una entidad o sea necesario para la integridad del sistema, LETO podrá:

- Eliminar únicamente los campos asociados a la tienda.
    
- Anonimizar identificadores.
    
- Desvincular relaciones.
    
- Conservar un registro técnico mínimo sin información que permita identificar razonablemente a la tienda.
    

---

## 4. Desinstalación y desconexión de TiendaNube

La desinstalación de LETO desde TiendaNube puede generar una notificación técnica destinada a informar a LETO que la integración fue retirada.

Tras recibir y validar el evento correspondiente, LETO puede iniciar procesos destinados a:

- Identificar la tienda afectada.
    
- Marcar la integración como desinstalada o revocada.
    
- Detener futuras sincronizaciones.
    
- Revocar o inutilizar credenciales.
    
- Invalidar sesiones cuando corresponda.
    
- Poner en cola las operaciones de eliminación.
    
- Registrar el estado de la solicitud.
    
- Ejecutar las acciones de compliance aplicables.
    

El procesamiento puede realizarse mediante el Backend FastAPI y tareas asíncronas ejecutadas a través de Redis y Celery.

La recepción del evento no significa necesariamente que la eliminación completa haya finalizado en ese mismo momento.

### 4.1. Acceso posterior a la desinstalación

Una vez que LETO conoce y valida una desinstalación, no deberá continuar realizando nuevas solicitudes ordinarias a la tienda utilizando credenciales revocadas.

Pueden existir operaciones ya iniciadas, mensajes en procesamiento o tareas pendientes que necesiten:

- Cancelarse.
    
- Finalizarse de forma segura.
    
- Ser descartadas.
    
- Ser reconciliadas.
    
- Registrarse como fallidas.
    

Estas operaciones no deberán utilizarse para continuar prestando el Servicio después de la revocación.

### 4.2. Reinstalación

Si una tienda reinstala LETO posteriormente:

- Podrá requerirse una nueva autorización.
    
- Se podrán generar nuevas credenciales.
    
- La reinstalación no garantiza que datos previamente eliminados sean recuperables.
    
- LETO podrá tratar la instalación como una nueva relación técnica.
    
- Los datos deberán volver a sincronizarse cuando corresponda.
    

Los datos eliminados no deberán restaurarse automáticamente desde registros históricos o respaldos para uso ordinario.

---

## 5. Solicitudes relativas a consumidores finales

LETO puede tratar datos de consumidores finales incluidos en órdenes, clientes u otros recursos autorizados por el comerciante.

Dependiendo de los datos recibidos, estos pueden incluir:

- Identificadores de cliente.
    
- Nombre.
    
- Correo electrónico.
    
- Teléfono.
    
- Dirección.
    
- Información asociada a órdenes.
    
- Identificadores operacionales.
    
- Otros datos incluidos en los recursos procesados.
    

LETO no utiliza estos datos para crear perfiles publicitarios ni perfiles independientes de marketing.

### 5.1. Solicitudes de eliminación

Cuando LETO reciba una solicitud válida relativa a un consumidor final, podrá:

- Localizar los registros asociados al consumidor dentro de la tienda correspondiente.
    
- Eliminar datos personales.
    
- Anonimizar campos.
    
- Desvincular identificadores.
    
- Conservar información transaccional mínima cuando exista una obligación válida.
    
- Registrar evidencia limitada del procesamiento.
    

La eliminación deberá ejecutarse únicamente sobre la tienda y el consumidor comprendidos en la solicitud.

### 5.2. Solicitudes de acceso o reporte

Cuando LETO reciba una solicitud válida de acceso o reporte, podrá:

- Buscar datos asociados al consumidor.
    
- Informar las categorías de datos encontradas.
    
- Informar que no se localizaron datos cuando corresponda.
    
- Entregar la información al comerciante o a TiendaNube mediante el canal autorizado.
    
- Solicitar información adicional para identificar al titular.
    

LETO no deberá entregar información cuando no pueda validar razonablemente:

- La identidad del titular.
    
- La relación con la tienda.
    
- La autenticidad de la solicitud.
    
- El alcance de la autorización recibida.
    

### 5.3. Solicitudes directas de consumidores

Cuando LETO actúe como procesador de datos por cuenta de un comerciante, el comerciante será normalmente el responsable de atender al consumidor.

En esos casos, LETO podrá:

- Remitir al consumidor al comerciante.
    
- Notificar al comerciante sobre la solicitud.
    
- Solicitar instrucciones.
    
- Colaborar con la localización, acceso o eliminación de datos.
    
- Responder directamente cuando exista una obligación legal o autorización válida.
    

El envío de una solicitud directamente a LETO no garantiza su ejecución inmediata sin participación o validación del comerciante.

---

## 6. Mecanismos técnicos de privacidad de TiendaNube

LETO mantiene mecanismos técnicos destinados a recibir solicitudes de privacidad enviadas por TiendaNube.

Estos mecanismos pueden corresponder a los siguientes eventos o callbacks:

|Evento de TiendaNube|Finalidad|
|---|---|
|`store/redact`|Solicitud de eliminación de datos asociados a una tienda|
|`customers/redact`|Solicitud de eliminación o anonimización de datos asociados a un consumidor|
|`customers/data_request`|Solicitud de acceso o reporte de datos asociados a un consumidor|

Las rutas HTTP internas o públicas utilizadas por LETO pueden no coincidir literalmente con el nombre del evento.

Por ese motivo, los nombres anteriores identifican la finalidad del evento y no deben interpretarse necesariamente como URLs destinadas al uso manual del comerciante.

### 6.1. Flujo general

El procesamiento previsto puede comprender:

1. Recepción de la solicitud.
    
2. Validación de autenticidad.
    
3. Identificación de la tienda.
    
4. Validación del alcance.
    
5. Registro de una clave de idempotencia.
    
6. Acuse de recibo técnico.
    
7. Envío a procesamiento asíncrono.
    
8. Ejecución de búsqueda, eliminación, anonimización o reporte.
    
9. Registro del resultado.
    
10. Manejo de errores y reintentos cuando corresponda.
    

### 6.2. Autenticidad

LETO debe validar la autenticidad de las solicitudes recibidas desde TiendaNube utilizando el mecanismo de firma o verificación establecido por la plataforma.

Las solicitudes cuya autenticidad no pueda validarse no deberán provocar:

- Eliminación de datos.
    
- Divulgación de datos.
    
- Acceso a información de otra tienda.
    
- Ejecución de procesos de compliance.
    

### 6.3. Procesamiento asíncrono

LETO utiliza Redis y Celery para tareas en segundo plano.

Cuando una solicitud no pueda completarse dentro del tiempo de respuesta técnica requerido por la plataforma, el Backend podrá:

- Validar y registrar la solicitud.
    
- Emitir el acuse técnico correspondiente.
    
- Delegar el procesamiento a un worker.
    
- Mantener un estado de seguimiento.
    

El acuse de recibo técnico no significa que la eliminación o el reporte hayan finalizado correctamente.

### 6.4. Estado de validación

ARCH-001 V1.5 clasifica el pipeline de compliance como implementado pero pendiente de validación integral de comportamiento end-to-end.

Por ello, LETO no presenta en esta Política como garantías absolutas:

- La eliminación instantánea.
    
- La ausencia total de errores.
    
- El cumplimiento automático de toda solicitud.
    
- La idempotencia perfecta ante cualquier fallo.
    
- La existencia de un audit trail completo para todos los caminos posibles.
    

Estos controles deben verificarse y fortalecerse de manera continua.

---

## 7. Alcance de una eliminación

Una solicitud válida de eliminación puede producir resultados diferentes según la categoría de datos.

|Categoría|Acción aplicable|
|---|---|
|Tokens y credenciales|Revocación, inutilización o eliminación|
|Datos de cuenta|Eliminación o desvinculación|
|Catálogo sincronizado|Eliminación|
|Órdenes y datos operacionales|Eliminación, anonimización o conservación limitada cuando exista obligación válida|
|Costos y parámetros|Eliminación|
|Resultados del Motor|Eliminación o desvinculación|
|Sesiones|Invalidación|
|Jobs pendientes|Cancelación, descarte o finalización segura|
|Logs|Eliminación conforme al ciclo aplicable o conservación limitada|
|Registros de compliance|Conservación mínima cuando sea necesaria para demostrar cumplimiento|
|Backups|Expiración mediante el ciclo de retención correspondiente|
|Datos anonimizados|Pueden conservarse si no permiten reidentificación razonable|

### 7.1. Eliminación frente a anonimización

LETO podrá anonimizar un dato en lugar de eliminar el registro completo cuando:

- Sea necesario preservar integridad referencial.
    
- El registro sea necesario para estadísticas legítimas.
    
- Exista una obligación de conservar información no identificable.
    
- La eliminación física pueda afectar registros de terceros.
    
- El dato anonimizado deje de ser razonablemente atribuible a una persona o tienda.
    

La simple eliminación del nombre o correo electrónico no constituye necesariamente anonimización suficiente.

La anonimización debe reducir razonablemente el riesgo de reidentificación considerando:

- Identificadores directos.
    
- Identificadores indirectos.
    
- Combinaciones de atributos.
    
- Relaciones con otros registros.
    
- Información disponible para LETO.
    

### 7.2. Datos agregados

LETO podrá conservar datos agregados cuando:

- No identifiquen a una persona.
    
- No identifiquen razonablemente a una tienda.
    
- No permitan reconstruir datos eliminados.
    
- No se utilicen para volver a contactar o perfilar al titular.
    

---

## 8. Excepciones y conservación limitada

LETO puede conservar determinados datos después de una solicitud de eliminación cuando exista una razón legítima y documentada.

Las excepciones pueden incluir:

|Excepción|Finalidad|
|---|---|
|Obligación legal|Cumplir normas fiscales, contables, judiciales, regulatorias o administrativas|
|Defensa de derechos|Formular, ejercer o defender reclamaciones|
|Prevención de fraude|Investigar abuso, fraude o accesos no autorizados|
|Seguridad|Analizar incidentes y proteger la infraestructura|
|Integridad del sistema|Evitar corrupción, duplicación o inconsistencias|
|Evidencia de compliance|Demostrar que una solicitud fue recibida y procesada|
|Resolución de disputas|Atender reclamos contractuales o comerciales|
|Copias de respaldo|Permitir la expiración segura dentro de ciclos técnicos de retención|
|Datos anonimizados|Mantener información no identificable para fines estadísticos o técnicos|

### 8.1. Condiciones de la conservación

Los datos conservados por una excepción deberán:

- Limitarse a lo necesario.
    
- Mantenerse separados del uso ordinario cuando sea posible.
    
- No utilizarse para marketing.
    
- No utilizarse para reactivar la cuenta.
    
- No utilizarse para generar nuevas recomendaciones.
    
- Permanecer sujetos a medidas de seguridad.
    
- Eliminarse cuando finalice la justificación.
    

### 8.2. Retención fiscal o contractual

La eliminación de una tienda no obliga a LETO a eliminar documentos que deban conservarse legalmente, tales como:

- Facturas.
    
- Comprobantes de pago.
    
- Registros contables.
    
- Contratos.
    
- Evidencia de aceptación.
    
- Comunicaciones relacionadas con disputas.
    

Cuando sea posible, estos registros se limitarán a la información necesaria para su finalidad legal.

### 8.3. Sin períodos fijos no aprobados

Hasta que LETO apruebe formalmente una matriz de retención, esta Política no establece como garantías generales períodos fijos de 30 o 90 días para logs y auditoría.

Los períodos concretos deberán definirse por categoría de datos conforme a:

- Necesidad operacional.
    
- Riesgo.
    
- Obligación legal.
    
- Capacidad técnica.
    
- Política interna de retención.
    
- Ciclos de infraestructura.
    
- Requerimientos de TiendaNube.
    

---

## 9. Registros de compliance, seguridad y auditoría

LETO puede mantener registros técnicos relacionados con:

- Solicitudes de eliminación.
    
- Solicitudes de acceso.
    
- Eventos de desinstalación.
    
- Validaciones de autenticidad.
    
- Estados de procesamiento.
    
- Errores.
    
- Reintentos.
    
- Entidades afectadas.
    
- Timestamps.
    
- Identificadores de tienda.
    
- Identificadores de correlación.
    
- Resultado de la operación.
    

Estos registros tienen como finalidad:

- Demostrar cumplimiento.
    
- Investigar incidentes.
    
- Detectar procesamiento duplicado.
    
- Diagnosticar fallas.
    
- Responder a disputas.
    
- Prevenir accesos no autorizados.
    
- Mantener integridad operacional.
    

### 9.1. Minimización de registros

Los registros de compliance y auditoría no deberán contener más datos personales de los necesarios.

En particular, LETO procurará evitar registrar:

- Tokens de acceso completos.
    
- Secretos.
    
- Contraseñas.
    
- Payloads personales completos cuando no sean necesarios.
    
- Datos de tarjetas.
    
- Credenciales bancarias.
    
- Información sensible ajena a la finalidad del registro.
    

### 9.2. Conservación de evidencia

Después de ejecutar una eliminación, LETO podrá conservar evidencia mínima que indique:

- Que la solicitud existió.
    
- Que fue validada.
    
- Que fue procesada.
    
- La fecha de ejecución.
    
- El resultado.
    
- La existencia de una excepción, si correspondiera.
    

Esta evidencia no deberá permitir recuperar de forma ordinaria el conjunto de datos eliminado.

### 9.3. Acceso

Los registros no son públicos.

Su acceso debe limitarse a:

- Personal autorizado.
    
- Procesos técnicos necesarios.
    
- Proveedores que los procesen por cuenta de LETO.
    
- Autoridades competentes cuando exista un requerimiento válido.
    
- Terceros que deban recibirlos para formular o defender derechos conforme a la ley.
    

---

## 10. Copias de respaldo e infraestructura de terceros

La infraestructura activa de LETO comprende:

|Proveedor|Función|
|---|---|
|Railway|Backend FastAPI, Railway PostgreSQL, Redis, Celery y componentes relacionados|
|Vercel|Hosting y distribución del Frontend Next.js|

Supabase, Supabase Auth y Netlify no forman parte de la infraestructura activa de producción.

GitHub se utiliza para desarrollo y control de versiones, pero no debe utilizarse deliberadamente para almacenar:

- Bases de datos de producción.
    
- Datos personales de clientes.
    
- Tokens de acceso.
    
- Secretos.
    
- Credenciales.
    
- Backups de tiendas.
    

### 10.1. Railway PostgreSQL

Los datos persistentes principales de LETO se almacenan en PostgreSQL administrado dentro de Railway.

La eliminación de los registros activos deberá ejecutarse sobre esta base de datos y sobre cualquier otro sistema de persistencia controlado por LETO que contenga los mismos datos.

### 10.2. Redis y Celery

Redis y Celery participan en el procesamiento asíncrono.

Una solicitud de eliminación puede requerir:

- Cancelar tareas pendientes.
    
- Evitar nuevos reintentos.
    
- Eliminar referencias temporales.
    
- Marcar mensajes como no procesables.
    
- Impedir que un job vuelva a crear datos eliminados.
    
- Reconciliar operaciones que estaban en curso.
    

Redis no deberá tratarse como fuente canónica de conservación permanente de datos de una tienda.

### 10.3. Vercel

Vercel aloja el Frontend.

El Frontend no debe ser la fuente principal de persistencia de datos operacionales de una tienda.

Sin embargo, Vercel puede procesar temporalmente:

- Dirección IP.
    
- Logs de solicitudes.
    
- Información del navegador.
    
- Datos técnicos asociados al acceso.
    

Estos datos pueden quedar sujetos a los ciclos de retención y operación del proveedor.

### 10.4. Respaldos y snapshots

La eliminación desde los sistemas activos puede no eliminar inmediatamente todas las copias existentes en:

- Backups.
    
- Snapshots.
    
- Réplicas.
    
- Logs del proveedor.
    
- Sistemas de recuperación ante desastres.
    
- Copias transitorias.
    

Los datos presentes en estas copias:

- Quedarán sujetos al ciclo de retención aplicable.
    
- No deberán restaurarse para uso ordinario después de una solicitud válida.
    
- Deberán volver a quedar sujetos a eliminación si una restauración técnica los reintroduce.
    
- Solo podrán utilizarse por razones legítimas de recuperación, seguridad o cumplimiento.
    

### 10.5. Limitaciones de control

LETO no controla directamente todos los sistemas internos de sus proveedores.

No obstante, LETO es responsable de:

- Seleccionar proveedores razonables.
    
- Configurar adecuadamente los servicios bajo su control.
    
- Ejecutar las eliminaciones disponibles.
    
- Evitar conservar copias innecesarias.
    
- Documentar ciclos de retención cuando sean conocidos.
    
- Atender solicitudes razonables relacionadas con dichos proveedores.
    

La política de privacidad de un proveedor no sustituye las obligaciones propias de LETO.

---

## 11. Plazos, verificación y estado de las solicitudes

Los plazos de procesamiento pueden depender de:

- Origen de la solicitud.
    
- Categoría de datos.
    
- Complejidad técnica.
    
- Necesidad de validar identidad.
    
- Participación del comerciante.
    
- Disponibilidad de TiendaNube.
    
- Existencia de datos en respaldos.
    
- Obligaciones legales aplicables.
    
- Incidentes o fallas técnicas.
    
- Volumen de datos.
    

### 11.1. Solicitudes de TiendaNube

Las solicitudes técnicas recibidas desde TiendaNube deben ser reconocidas dentro del tiempo requerido por la plataforma cuando sea técnicamente posible.

El acuse técnico no significa que:

- La eliminación completa haya finalizado.
    
- Todos los respaldos hayan expirado.
    
- No existan excepciones legales.
    
- El proceso no pueda fallar posteriormente.
    

El procesamiento sustantivo podrá continuar de forma asíncrona.

### 11.2. Solicitudes directas

Las solicitudes enviadas directamente a LETO serán atendidas dentro de los plazos exigidos por la normativa aplicable.

Cuando no exista un plazo legal específico, LETO procurará:

- Confirmar la recepción dentro de un período razonable.
    
- Solicitar la información faltante.
    
- Informar cuando la solicitud sea compleja.
    
- Completarla sin demoras injustificadas.
    

### 11.3. Información requerida

LETO podrá solicitar:

- Nombre del solicitante.
    
- Correo electrónico.
    
- Nombre o dominio de la tienda.
    
- Identificador de TiendaNube.
    
- Evidencia de autoridad.
    
- Identificador del consumidor.
    
- Número de orden.
    
- Descripción del derecho ejercido.
    
- Información adicional necesaria para localizar los datos.
    

No deberá solicitarse más información de la necesaria para validar y ejecutar la solicitud.

### 11.4. Rechazo o limitación

LETO podrá rechazar o limitar una solicitud cuando:

- No pueda verificar su legitimidad.
    
- Se refiera a datos que LETO no posee.
    
- Sea manifiestamente infundada o abusiva.
    
- Afecte derechos de terceros.
    
- Exista una obligación legal de conservación.
    
- La solicitud exceda el alcance de los datos tratados por LETO.
    
- Su cumplimiento sea legalmente improcedente.
    

Cuando corresponda, LETO informará:

- El motivo.
    
- El alcance que sí puede procesarse.
    
- La información adicional necesaria.
    
- Los mecanismos de reclamación disponibles según la normativa aplicable.
    

### 11.5. Estado de una solicitud

Una solicitud podrá encontrarse en alguno de los siguientes estados:

- Recibida.
    
- Pendiente de validación.
    
- Validada.
    
- Rechazada.
    
- En procesamiento.
    
- Parcialmente completada.
    
- Completada.
    
- Completada con excepción de conservación.
    
- Fallida.
    
- Pendiente de reintento.
    

Estos estados son operacionales y pueden evolucionar durante el procesamiento.

---

## 12. Contacto y actualizaciones

### 12.1. Contacto

Para ejercer derechos, solicitar eliminación o realizar consultas:

**LETO — Consultas de privacidad y eliminación de datos**

Correo electrónico: **[letocorp.uy@gmail.com](mailto:letocorp.uy@gmail.com)**

Se recomienda utilizar alguno de los siguientes asuntos:

- `Solicitud de eliminación de datos`
    
- `Solicitud de acceso a datos`
    
- `Solicitud relativa a consumidor final`
    
- `Desinstalación de tienda`
    

La solicitud deberá incluir información suficiente para identificar:

- Al solicitante.
    
- La tienda involucrada.
    
- El titular o consumidor correspondiente.
    
- El alcance de la solicitud.
    

LETO no solicitará contraseñas, claves privadas ni tokens completos por correo electrónico.

### 12.2. Actualizaciones

LETO puede actualizar esta Política cuando exista:

- Un cambio en la arquitectura.
    
- Un cambio en la infraestructura.
    
- Un nuevo proveedor.
    
- Un cambio en TiendaNube.
    
- Una modificación legal o regulatoria.
    
- Un cambio en los mecanismos de eliminación.
    
- Una nueva categoría de datos.
    
- Una modificación de los ciclos de retención.
    
- Un cambio material en los procesos de compliance.
    

La versión y fecha vigentes se indicarán al inicio del documento.

Cuando una modificación sea material, LETO procurará comunicarla mediante:

- Correo electrónico.
    
- Aviso dentro del Servicio.
    
- Publicación en el sitio oficial.
    
- Otro canal razonable.
    

La versión vigente estará disponible en el dominio o URL oficial utilizado por LETO para publicar su documentación legal.

No deberá considerarse vigente una copia publicada únicamente en una antigua URL de Netlify.

---

**LETO · Política de Eliminación de Datos · Versión 1.1 · Junio de 2026**

**Contacto:** [letocorp.uy@gmail.com](mailto:letocorp.uy@gmail.com)
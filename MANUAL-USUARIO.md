# Manual de usuario — CARSA Web

Guía para **clientes** que usan la tienda en línea y para el **personal administrador** que gestiona catálogo, pedidos y ventas.

---

## Índice

1. [¿Qué es CARSA Web?](#qué-es-carsa-web)
2. [Guía para clientes](#guía-para-clientes)
3. [Guía para administradores](#guía-para-administradores)
4. [Preguntas frecuentes](#preguntas-frecuentes)
5. [Soporte](#soporte)

---

## ¿Qué es CARSA Web?

Es el sitio oficial de CARSA en Portoviejo. Permite:

- Ver llantas, baterías y servicios de taller con precios y disponibilidad.
- Armar un carrito y **solicitar un pedido** en línea (CARSA confirma por teléfono o WhatsApp).
- Gestionar, desde el panel admin, productos, promociones, pedidos y ventas.

**No es una pasarela de pago en línea:** el pedido es una solicitud; CARSA contacta al cliente para confirmar y cobrar en tienda.

---

## Guía para clientes

### Navegar el catálogo

1. Entra a la página de inicio del sitio.
2. Usa el menú para ir a **Inicio**, **Llantas**, **Baterías** o baja hasta **Servicios**.
3. En inicio puedes **buscar** por medida, marca o modelo.
4. Las tarjetas muestran precio y existencias (llantas y baterías).

### Ver detalle de un producto

1. Haz clic en la imagen o en la tarjeta de una llanta o batería.
2. Se abre una ventana con más información, precio y cantidad.
3. Si hay stock, puedes **Agregar al carrito**.

### Servicios de taller

- Los servicios (por ejemplo alineación y balanceo) muestran precio cuando está configurado.
- El botón **Consultar** abre WhatsApp para agendar o pedir más información.

### WhatsApp

- El botón flotante rojo (esquina inferior) abre un chat con CARSA.
- También hay enlaces de contacto en el pie de página.

### Crear cuenta

1. Ve a **Crear cuenta** / **Registro**.
2. Completa correo, contraseña y datos solicitados.
3. Si el sistema pide confirmar el correo, revisa tu bandeja de entrada antes de iniciar sesión.

### Iniciar sesión

1. Entra a **Iniciar sesión**.
2. Usa tu correo y contraseña.
3. Si olvidaste la contraseña, usa **¿Olvidaste tu contraseña?** y sigue el enlace del correo.

### Mi cuenta

En **Mi cuenta** puedes ver:

- Tu nombre y correo.
- Teléfono registrado (necesario para que CARSA te contacte por un pedido).

**Importante:** sin teléfono en el perfil no podrás enviar pedidos desde el carrito.

### Carrito y pedido

1. Agrega productos desde el catálogo.
2. Abre **Carrito** desde el menú o el icono del carrito.
3. Revisa cantidades; puedes quitar líneas o cambiar cantidades según stock.
4. Pulsa **Confirmar pedido** (debes tener sesión iniciada y teléfono en tu cuenta).
5. Verás un mensaje de confirmación en **Mi cuenta**. CARSA revisará existencias y te contactará.

### Promociones

- Al entrar al sitio pueden mostrarse **pop-ups** con ofertas activas.
- Ciérralos con la **X** si no te interesan; puedes seguir navegando con normalidad.

---

## Guía para administradores

Solo usuarios con rol **administrador** acceden a `/admin`. Si entras con cuenta de cliente, verás un aviso de acceso denegado.

### Entrar al panel

1. Inicia sesión con tu correo de administrador.
2. Serás redirigido al panel o abre manualmente `/admin`.
3. Para salir, usa **Cerrar sesión** en el menú lateral.

### Dashboard

Resumen con:

- Cantidad de llantas, baterías y servicios activos.
- Productos con **stock bajo**.
- Pedidos pendientes de atención.
- Ventas registradas e ingresos del mes.

Si algún dato no carga, aparecerá un aviso amarillo; el resto del panel sigue usable.

### Llantas y baterías

En **Llantas** y **Baterías** puedes:

| Acción | Cómo hacerlo |
|--------|----------------|
| Crear | Botón **Nueva** / **Nuevo** → completa el formulario → **Guardar** |
| Editar | Icono de lápiz en la fila |
| Eliminar | Icono de papelera (confirma en el diálogo) |
| Imagen | Sube una foto en el formulario (JPG/PNG, máx. 5 MB) |
| Destacar | Marca **Destacado** para priorizar en el catálogo |
| Activar / desactivar | **Activo** controla si se ve en la web |

Campos habituales: marca, nombre, medida, precio, stock, descripción, código de proveedor (opcional).

Los cambios de stock y precio se reflejan en el catálogo público tras guardar.

### Servicios

En **Servicios**:

- Define **nombre**, **precio**, **descripción** e **imagen**.
- El **enlace del servicio** (opcional) es un identificador interno para la web; no hace falta que el cliente lo vea.
- Si tienes dos servicios separados “Alineación” y “Balanceo”, la web puede mostrar **una sola tarjeta combinada** con el precio sumado de ambos.

### Marcas

En **Marcas** gestionas marcas de llantas y de baterías por separado. Crea la marca antes de asignarla a un producto nuevo.

### Promociones

En **Promociones**:

1. Sube una **imagen** (obligatoria).
2. Título y opciones **Activa** / **Mostrar como popup**.
3. Solo las promociones activas con popup aparecen al entrar al sitio.

### Pedidos

En **Pedidos** ves las solicitudes de clientes en línea.

| Estado | Significado sugerido |
|--------|----------------------|
| Pendiente | Recién recibido; revisar y contactar al cliente |
| Confirmado | Cliente confirmado; listo para venta en tienda |
| Completado | Atendido y cerrado |
| Cancelado | No se procesará |

**Flujo recomendado:**

1. Abre el pedido (icono del ojo).
2. Revisa productos, totales y datos del cliente.
3. Cambia el estado cuando corresponda.
4. Si el cliente compra en tienda, registra la venta en **Ventas** (ver abajo).

Puedes filtrar por estado y buscar por nombre o teléfono.

### Ventas

En **Ventas** registras una venta ligada a un **pedido confirmado**:

1. Pulsa registrar venta / nuevo según la pantalla.
2. Elige el **pedido confirmado** en la lista (muestra cliente, total y fecha).
3. Indica **método de pago** y notas si aplica.
4. Al guardar, el sistema descuenta stock de llantas y baterías del pedido y marca el pedido como completado.

No registres ventas desde pedidos aún pendientes: el sistema lo impedirá con un mensaje claro.

### Notificaciones

**Campana (siempre que el panel esté abierto):**

- Avisa cuando llega un **pedido nuevo**.
- Marca como leídas desde el menú de la campana.

**Push en el navegador (opcional):**

1. En el panel, busca **Activar notificaciones**.
2. Acepta el permiso del navegador.
3. Debe indicar “Notificaciones activadas en este dispositivo”.

Si falla la activación, suele deberse a claves VAPID mal copiadas o a no haber reiniciado el servidor tras cambiar `.env.local`. Consulta al responsable técnico.

### Buenas prácticas para administradores

- Mantén **stock** actualizado para evitar pedidos de productos agotados.
- Confirma pedidos por teléfono antes de pasar a **Confirmado**.
- Usa imágenes claras y nombres entendibles para el cliente.
- Revisa el dashboard al inicio del día para stock bajo y pedidos pendientes.

---

## Preguntas frecuentes

### El cliente no puede enviar el pedido

- ¿Inició sesión?
- ¿Tiene **teléfono** guardado en Mi cuenta?
- ¿El carrito tiene productos con stock?

### No aparece el precio de un servicio

- Revisa que el servicio esté **activo** y con precio mayor a cero en admin.
- Si son dos servicios (alineación + balanceo), el precio en web puede ser la **suma** de ambos.

### El administrador no entra al panel

- La cuenta debe tener rol **admin** en el sistema (lo configura soporte técnico).
- Cierra sesión y vuelve a entrar.

### Las notificaciones push no llegan

- Claves VAPID correctas en el servidor.
- Permiso del navegador concedido.
- En producción, variable `SUPABASE_SERVICE_ROLE_KEY` configurada.
- La campana interna del panel funciona aunque el push falle.

### ¿Se paga en la web?

No. El sitio envía **solicitudes de pedido**; el pago y la entrega se acuerdan con CARSA.

---

## Soporte

Para incidencias técnicas (sitio caído, errores al guardar, accesos):

- Contacta al desarrollador o responsable de TI de CARSA.
- Indica qué pantalla usabas, qué botón pulsaste y, si puedes, adjunta una captura.

Para consultas comerciales (productos, precios, citas en taller):

- Usa los canales habituales de CARSA (WhatsApp, teléfono, tienda en Portoviejo).

---

*Última actualización: documentación alineada con CARSA Web (Next.js + panel admin).*

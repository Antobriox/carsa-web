export type FaqItem = {
  id: string
  question: string
  answer: string
  /** Muestra enlace a Google Maps al final de la respuesta. */
  showMapsLink?: boolean
}

export const FAQ_SUBTITLE =
  'Resolvemos las dudas más comunes sobre pedidos, llantas, baterías, servicios y atención en CARSA.'

export const faqItems: FaqItem[] = [
  {
    id: 'compra-directa',
    question: '¿Puedo comprar directamente desde la página?',
    answer:
      'Por ahora, la página permite realizar pedidos o cotizaciones. Después de enviar un pedido, CARSA revisará disponibilidad y se comunicará contigo por WhatsApp o teléfono para confirmar la compra, el pago y la instalación si aplica.',
  },
  {
    id: 'pedido-vs-compra',
    question: '¿El pedido significa que ya compré el producto?',
    answer:
      'No. El pedido es una solicitud de compra o cotización. La venta se confirma cuando CARSA valida la disponibilidad, acuerda la forma de pago y registra la venta.',
  },
  {
    id: 'telefono-obligatorio',
    question: '¿Por qué necesito registrar mi número de teléfono?',
    answer:
      'Porque CARSA necesita contactarte para confirmar disponibilidad, compatibilidad del producto, forma de pago, instalación, retiro o entrega. Sin un número de contacto, no se puede gestionar correctamente el pedido.',
  },
  {
    id: 'precios-definitivos',
    question: '¿Los precios de la página son definitivos?',
    answer:
      'Los precios publicados son referenciales y pueden estar sujetos a confirmación. CARSA procurará mantenerlos actualizados, pero el precio final se confirma antes de concretar la venta.',
  },
  {
    id: 'stock-exacto',
    question: '¿El stock que aparece en la página es exacto?',
    answer:
      'El stock mostrado sirve como referencia. Antes de confirmar una venta, CARSA verificará la disponibilidad real del producto.',
  },
  {
    id: 'consultar-antes',
    question: '¿Puedo consultar antes de hacer un pedido?',
    answer:
      'Sí. En cada producto puedes usar el botón de WhatsApp para consultar directamente con CARSA antes de agregarlo al carrito o confirmar un pedido.',
  },
  {
    id: 'llanta-vehiculo',
    question: '¿Cómo sé qué llanta necesita mi vehículo?',
    answer:
      'Puedes revisar la medida actual de tu llanta, por ejemplo 195/65R15, o escribir a CARSA por WhatsApp para recibir asesoría. El equipo puede ayudarte a confirmar la medida adecuada.',
  },
  {
    id: 'datos-llanta',
    question: '¿Qué datos debo revisar antes de pedir una llanta?',
    answer:
      'Debes revisar principalmente la medida, el rin, el modelo, el precio y la disponibilidad. Si tienes dudas, es recomendable contactar por WhatsApp antes de confirmar el pedido.',
  },
  {
    id: 'instalacion-llantas',
    question: '¿CARSA instala las llantas?',
    answer:
      'Sí, CARSA puede ofrecer servicios relacionados como instalación, alineación y balanceo, según disponibilidad y coordinación previa.',
  },
  {
    id: 'servicios-ofrecidos',
    question: '¿Qué servicios ofrece CARSA?',
    answer:
      'CARSA ofrece servicios como alineación y balanceo, instalación de llantas, cambio de batería y revisión de batería.',
  },
  {
    id: 'bateria-web',
    question: '¿Puedo pedir una batería desde la web?',
    answer:
      'Sí. Puedes revisar las baterías disponibles, ver sus detalles, agregarlas al carrito y enviar un pedido para que CARSA confirme disponibilidad y compatibilidad.',
  },
  {
    id: 'compatibilidad-bateria',
    question: '¿Cómo sé si una batería es compatible con mi vehículo?',
    answer:
      'Debes revisar datos como amperaje, voltaje, polaridad y modelo. Si no estás seguro, contacta a CARSA por WhatsApp para recibir ayuda.',
  },
  {
    id: 'promociones-automaticas',
    question: '¿Las promociones aplican automáticamente?',
    answer:
      'No necesariamente. Las promociones mostradas en la página son informativas. CARSA confirmará las condiciones de cada promoción antes de concretar la venta.',
  },
  {
    id: 'forma-pago',
    question: '¿Cómo pago mi pedido?',
    answer:
      'El pago se coordina directamente con CARSA después de confirmar disponibilidad. Puede ser efectivo, transferencia, tarjeta u otro método disponible según lo indique el negocio.',
  },
  {
    id: 'retiro-local',
    question: '¿Puedo retirar el producto en el local?',
    answer:
      'Sí. El retiro o instalación puede coordinarse directamente con CARSA por WhatsApp o teléfono después de confirmar el pedido.',
  },
  {
    id: 'sin-stock',
    question: '¿Qué pasa si hago un pedido y ya no hay stock?',
    answer:
      'CARSA se comunicará contigo para informarte y, si es posible, ofrecer una alternativa disponible.',
  },
  {
    id: 'cancelar-pedido',
    question: '¿Puedo cancelar un pedido?',
    answer:
      'Sí. Mientras el pedido no haya sido confirmado como venta, puedes comunicarte con CARSA para solicitar la cancelación.',
  },
  {
    id: 'carrito-stock',
    question: '¿El carrito descuenta stock?',
    answer:
      'No. El stock no se descuenta cuando agregas productos al carrito ni cuando envías un pedido. El stock se actualiza cuando CARSA registra la venta confirmada.',
  },
  {
    id: 'ubicacion',
    question: '¿Dónde está ubicado CARSA?',
    answer:
      'CARSA está ubicado en Avenida Metropolitana, Montecristi, Manabí, Ecuador. Puedes ver la ubicación en el mapa del sitio y abrirla directamente en Google Maps.',
    showMapsLink: true,
  },
  {
    id: 'contacto',
    question: '¿Cómo puedo contactar a CARSA?',
    answer:
      'Puedes contactar a CARSA mediante el botón de WhatsApp disponible en la página o usando los datos de contacto publicados en el sitio.',
  },
]

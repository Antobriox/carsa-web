self.addEventListener('push', (event) => {
  let data = {
    title: 'Nuevo pedido recibido',
    body: 'Tienes un pedido nuevo en CARSA',
    url: '/admin/pedidos',
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        url: parsed.url || data.url,
      }
    }
  } catch {
    /* usar valores por defecto */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/Imagen/LANTITAS.png',
      badge: '/Imagen/LANTITAS.png',
      data: { url: data.url },
      tag: 'carsa-new-order',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin/pedidos'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client && client.url.includes(self.location.origin)) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
        return undefined
      })
  )
})

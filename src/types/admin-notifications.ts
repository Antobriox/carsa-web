export type AdminNotification = {
  id: string
  type: string | null
  order_id: string | null
  title: string
  message: string
  payload: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export type AdminNotificationRead = {
  id: string
  notification_id: string
  user_id: string
  read_at: string
}

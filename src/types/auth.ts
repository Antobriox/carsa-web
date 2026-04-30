export type ProfileRole = 'customer' | 'admin'

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: ProfileRole
}

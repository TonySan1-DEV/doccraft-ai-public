import { supabase } from '../supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
  tier: 'Free' | 'Pro' | 'Admin'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    collaboration_enabled: boolean
  }
}

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar_url?: string
  color: string
  initials: string
  isOnline: boolean
  lastSeen: Date
}

export class UserService {
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return null

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return null
      }

      return profile as UserProfile
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }

  static async getCollaborationUsers(roomId: string): Promise<CollaborationUser[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          user_id,
          profiles!inner(id, full_name, email, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching collaboration users:', error)
        return []
      }

      return (data as any[]).map(session => ({
        id: session.user_id,
        name: session.profiles?.full_name || 'Unknown User',
        email: session.profiles?.email || '',
        avatar_url: session.profiles?.avatar_url,
        color: this.generateUserColor(session.user_id),
        initials: this.generateUserInitials(session.profiles?.full_name || 'Unknown User'),
        isOnline: true,
        lastSeen: new Date()
      }))
    } catch (error) {
      console.error('Error getting collaboration users:', error)
      return []
    }
  }

  static generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#FAD7A0'
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  static generateUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
} 
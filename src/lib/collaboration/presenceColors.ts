// Deterministic color generation based on user ID hash
const presenceColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Sky Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Salmon
  '#85C1E9', // Light Blue
  '#FAD7A0', // Peach
]

export function getUserColor(userId: string): string {
  // Simple hash function to generate consistent color from user ID
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get color index
  const colorIndex = Math.abs(hash) % presenceColors.length
  return presenceColors[colorIndex]
}

export function getUserInitials(userName: string): string {
  return userName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateUserAvatar(userId: string, userName: string): {
  color: string
  initials: string
} {
  return {
    color: getUserColor(userId),
    initials: getUserInitials(userName)
  }
} 
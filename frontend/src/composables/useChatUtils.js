const avatarColors = ['var(--status-away)','#ef4444','#8b5cf6','#06b6d4','var(--status-online)','#f97316','#ec4899','var(--accent)','#14b8a6','#eab308']

export function nameColor(name) {
  if (!name) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function getAvatarUrl(avatarPath, name) {
  if (!avatarPath || !avatarPath.trim() || avatarPath.trim() === '/default-avatar.png') {
    const n = String(name || '?')
    const color = nameColor(n)
    const letter = n[0].toUpperCase()
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="${color}"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="600" font-family="system-ui,sans-serif">${letter}</text></svg>`)}`
  }
  const path = avatarPath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${window.location.origin}${path}`
  return `${window.location.origin}/${path}`
}

export function getRoomListAvatar(room) {
  if (!room?.avatar) return null
  const path = room.avatar.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${window.location.origin}${path}`
  return `${window.location.origin}/${path}`
}

export function getPostImageUrl(imgPath) {
  if (!imgPath) return ''
  const path = imgPath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${window.location.origin}${path}`
  return `${window.location.origin}/${path}`
}

export function getMessageImageUrl(msg) {
  const url = msg.file_url || msg.content
  return getPostImageUrl(url)
}

export function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前'
  return d.toLocaleDateString('zh-CN')
}

export function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days < 7) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
}

export function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getFileIcon(fileName) {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop().toLowerCase()
  const icons = {
    pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
    ppt: '📙', pptx: '📙', zip: '📦', rar: '📦', txt: '📝',
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼'
  }
  return icons[ext] || '📄'
}

export function isEffectivelyMuted(member) {
  if (!member.is_muted) return false
  if (!member.muted_until) return true
  return new Date(member.muted_until).getTime() > Date.now()
}

export function compressImage(file) {
  return new Promise((resolve) => {
    if (file.type === 'image/gif') {
      resolve(file)
      return
    }
    const maxWidth = 1920
    const maxSize = 1 * 1024 * 1024
    if (file.size < maxSize) {
      resolve(file)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > maxWidth) {
        h = h * maxWidth / w
        w = maxWidth
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file)
          return
        }
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
        resolve(compressedFile)
      }, 'image/jpeg', 0.85)
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

export function formatUnread(count) {
  return count > 99 ? '99+' : String(count)
}
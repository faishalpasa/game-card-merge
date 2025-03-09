const MAX_OFFLINE_HOURS = 2
const MILLISECONDS_PER_HOUR = 3600000

export const calculateOfflineTime = (lastSaveTime: number): number => {
  const currentTime = Date.now()
  const timeDifferenceHours =
    (currentTime - lastSaveTime) / MILLISECONDS_PER_HOUR

  // Cap at MAX_OFFLINE_HOURS
  return Math.min(timeDifferenceHours, MAX_OFFLINE_HOURS)
}

export const calculateOfflineScore = (
  cards: { level: number; value: number }[],
  offlineHours: number
): number => {
  // Calculate base score from all cards
  const baseScore = cards.reduce((total, card) => {
    return total + card.level * card.value
  }, 0)

  // Calculate hourly rate (let's say 10% of base score per hour)
  const hourlyRate = baseScore * 0.1

  // Calculate total offline earnings
  return Math.floor(hourlyRate * offlineHours)
}

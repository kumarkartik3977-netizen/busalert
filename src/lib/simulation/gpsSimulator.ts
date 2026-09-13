interface GpsPoint {
  latitude: number
  longitude: number
}

interface TickResult {
  latitude: number
  longitude: number
  speed: number
  currentStopIndex: number
  nextStopIndex: number
  arrivedStopIndices: number[]
}

function haversineDistance(a: GpsPoint, b: GpsPoint): number {
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function interpolate(a: GpsPoint, b: GpsPoint, t: number): GpsPoint {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  }
}

export class GpsSimulator {
  private stops: GpsPoint[]
  private speedKmph: number
  private progress: number
  private speedReadings: number[]
  private arrivedStops: Set<number>
  private startTime: Date
  private stopTimes: Map<number, Date>
  private segmentDistances: number[]
  private totalDistance: number
  private tickCount: number

  constructor(stops: GpsPoint[], speedKmph: number = 30) {
    this.stops = stops
    this.speedKmph = speedKmph
    this.progress = 0
    this.speedReadings = []
    this.arrivedStops = new Set()
    this.startTime = new Date()
    this.stopTimes = new Map()
    this.tickCount = 0

    this.segmentDistances = []
    this.totalDistance = 0
    for (let i = 0; i < stops.length - 1; i++) {
      const dist = haversineDistance(stops[i], stops[i + 1])
      this.segmentDistances.push(dist)
      this.totalDistance += dist
    }
  }

  tick(deltaSeconds: number = 15): TickResult {
    const currentSpeed = this.getCurrentSpeed()
    const distanceKm = (currentSpeed * deltaSeconds) / 3600
    const progressDelta = this.totalDistance > 0 ? distanceKm / this.totalDistance : 0
    this.progress = Math.min(1, this.progress + progressDelta)

    this.tickCount++
    if (this.tickCount % 3 === 0) {
      const jitter = (Math.random() - 0.5) * 10
      const newSpeed = Math.max(5, this.speedKmph + jitter)
      this.speedReadings.push(newSpeed)
      if (this.speedReadings.length > 5) {
        this.speedReadings.shift()
      }
    }

    const accumulatedDistance = this.progress * this.totalDistance
    let distanceCovered = 0
    let currentSegmentIndex = 0
    let segmentProgress = 0

    for (let i = 0; i < this.segmentDistances.length; i++) {
      if (distanceCovered + this.segmentDistances[i] >= accumulatedDistance) {
        currentSegmentIndex = i
        segmentProgress = this.segmentDistances[i] > 0
          ? (accumulatedDistance - distanceCovered) / this.segmentDistances[i]
          : 0
        break
      }
      distanceCovered += this.segmentDistances[i]
      currentSegmentIndex = i
      segmentProgress = 1
    }

    const position = interpolate(
      this.stops[currentSegmentIndex],
      this.stops[Math.min(currentSegmentIndex + 1, this.stops.length - 1)],
      segmentProgress
    )

    const currentStopIndex = Math.max(
      0,
      Math.min(
        currentSegmentIndex,
        this.stops.length - 1
      )
    )
    const nextStopIndex = Math.min(currentSegmentIndex + 1, this.stops.length - 1)

    for (let i = 0; i < this.stops.length; i++) {
      if (!this.arrivedStops.has(i)) {
        const distanceMeters = haversineDistance(position, this.stops[i]) * 1000
        if (distanceMeters <= 150) {
          this.arrivedStops.add(i)
          this.stopTimes.set(i, this.getCurrentTime())
        }
      }
    }

    const smoothedSpeed =
      this.speedReadings.length > 0
        ? this.speedReadings.reduce((a, b) => a + b, 0) / this.speedReadings.length
        : this.speedKmph

    return {
      latitude: position.latitude,
      longitude: position.longitude,
      speed: smoothedSpeed,
      currentStopIndex,
      nextStopIndex,
      arrivedStopIndices: Array.from(this.arrivedStops),
    }
  }

  reset(): void {
    this.progress = 0
    this.speedReadings = []
    this.arrivedStops = new Set()
    this.startTime = new Date()
    this.stopTimes = new Map()
    this.tickCount = 0
  }

  getCurrentTime(): Date {
    const elapsedSeconds = (this.progress * this.totalDistance) / this.speedKmph * 3600
    return new Date(this.startTime.getTime() + elapsedSeconds * 1000)
  }

  private getCurrentSpeed(): number {
    return this.speedReadings.length > 0
      ? this.speedReadings.reduce((a, b) => a + b, 0) / this.speedReadings.length
      : this.speedKmph
  }
}

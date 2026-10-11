import { IDistributorLocation, IRouteDirectionResult } from "@/types/domain";

/**
 * Geo-Routing & Distance Calculation Engine
 * Implements high-precision Haversine spherical math, road distance multipliers,
 * and OSRM turn-by-turn route navigation with resilient offline fallback.
 */

const EARTH_RADIUS_KM = 6371.0;
const BANGLADESH_URBAN_ROAD_FACTOR = 1.28; // Urban road curvature in Dhaka/Chittagong
const AVERAGE_DELIVERY_SPEED_KMH = 22.0;   // Real delivery van transit speed
const STAGING_PREP_MINUTES = 12;           // Depot pick & pack prep time

export class GeoRoutingEngine {
  /**
   * Calculate precise straight-line distance between two geographic coordinates
   * using the Haversine formula.
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = EARTH_RADIUS_KM * c;

    return Number(distanceKm.toFixed(2));
  }

  /**
   * Estimates road distance and transit duration based on straight-line distance
   * and Bangladesh metropolitan logistics factors.
   */
  public static estimateRoadMetrics(straightKm: number): {
    roadKm: number;
    durationMinutes: number;
  } {
    const roadKm = Number((straightKm * BANGLADESH_URBAN_ROAD_FACTOR).toFixed(2));
    const transitHours = roadKm / AVERAGE_DELIVERY_SPEED_KMH;
    const durationMinutes = Math.max(
      15,
      Math.round(transitHours * 60 + STAGING_PREP_MINUTES)
    );

    return { roadKm, durationMinutes };
  }

  /**
   * Fetches real road routing polyline from OSRM public service.
   * Gracefully falls back to synthesized road curvature polyline if offline or timeout.
   */
  public static async getRoadRoute(
    startLat: number,
    startLon: number,
    destLat: number,
    destLon: number
  ): Promise<IRouteDirectionResult> {
    const straightKm = this.calculateHaversineDistance(startLat, startLon, destLat, destLon);
    const estimated = this.estimateRoadMetrics(straightKm);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      // OSRM expects coordinates in {lon},{lat} order
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`;

      const response = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "MedSupplyBD-Logistics/1.0" },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON coordinates are [lon, lat], Leaflet expects [lat, lon]
          const coordinates: [number, number][] = route.geometry.coordinates.map(
            (pt: [number, number]) => [pt[1], pt[0]]
          );

          return {
            coordinates,
            distanceKm: Number((route.distance / 1000).toFixed(2)),
            durationMinutes: Math.round(route.duration / 60) + STAGING_PREP_MINUTES,
            source: "OSRM_REALTIME",
          };
        }
      }
    } catch {
      // Fallback silently if OSRM service is rate-limited, offline, or timed out
    }

    // Generate interpolated realistic curved polyline between the two points
    const fallbackCoordinates = this.generateFallbackPolyline(
      startLat,
      startLon,
      destLat,
      destLon
    );

    return {
      coordinates: fallbackCoordinates,
      distanceKm: estimated.roadKm,
      durationMinutes: estimated.durationMinutes,
      source: "ESTIMATED_ROAD_MODEL",
    };
  }

  /**
   * Generates a curved realistic road route polyline with simulated waypoints
   * to avoid a simple straight diagonal line on the map.
   */
  public static generateFallbackPolyline(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): [number, number][] {
    const points: [number, number][] = [[lat1, lon1]];
    const steps = 8;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      // Linear interpolation
      let lat = lat1 + (lat2 - lat1) * t;
      let lon = lon1 + (lon2 - lon1) * t;

      // Add gentle orthogonal sinusoidal curve to simulate road deviation
      const curveOffset = Math.sin(t * Math.PI) * 0.0035;
      lat += (lon2 - lon1 > 0 ? 1 : -1) * curveOffset;
      lon += (lat2 - lat1 > 0 ? -1 : 1) * (curveOffset * 0.7);

      points.push([Number(lat.toFixed(6)), Number(lon.toFixed(6))]);
    }

    points.push([lat2, lon2]);
    return points;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180.0;
  }
}

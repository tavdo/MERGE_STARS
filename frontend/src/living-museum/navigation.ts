import type { MuseumView, MuseumSceneId } from './lib/museum-tour'
import type { SpatialJourney } from './lib/museum-spatial'

// In-memory navigation only. No identities, product records or rights are cached here.
export const museumNavigation: {
  entered: boolean; view?: MuseumView; sceneId: MuseumSceneId; spatial?: SpatialJourney; catalogOpen?: boolean;
} = { entered: false, sceneId: 'coin' }

export function categoryForPoint(point: string): string {
  return ({ automotive: 'transport', motorcycles: 'transport', bathroom: 'sanitaryware', architecture: 'construction', case: 'accessories', mosaic: 'art', collectibles: 'souvenirs', dining: 'decor', games: 'toys', overview: '' } as Record<string, string>)[point] ?? point
}

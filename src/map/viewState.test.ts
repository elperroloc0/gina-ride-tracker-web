import { describe, expect, it } from 'vitest';
import { fitViewState } from './viewState';

describe('fitViewState', () => {
  it('centers on the midpoint of the two points', () => {
    const view = fitViewState({ latitude: 25.7, longitude: -80.4 }, { latitude: 25.8, longitude: -80.2 });
    expect(view.latitude).toBeCloseTo(25.75, 5);
    expect(view.longitude).toBeCloseTo(-80.3, 5);
  });

  it('zooms out further for two points that are farther apart', () => {
    const close = fitViewState({ latitude: 25.7, longitude: -80.4 }, { latitude: 25.71, longitude: -80.39 });
    const far = fitViewState({ latitude: 25.7, longitude: -80.4 }, { latitude: 26.5, longitude: -79.5 });
    expect(far.zoom).toBeLessThan(close.zoom);
  });

  it('clamps zoom to a sane range for near-identical or very distant points', () => {
    const sameSpot = fitViewState({ latitude: 25.7, longitude: -80.4 }, { latitude: 25.7, longitude: -80.4 });
    expect(sameSpot.zoom).toBeLessThanOrEqual(14);

    const veryFar = fitViewState({ latitude: 10, longitude: -100 }, { latitude: 50, longitude: -60 });
    expect(veryFar.zoom).toBeGreaterThanOrEqual(10);
  });
});

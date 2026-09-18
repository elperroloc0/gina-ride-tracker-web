import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BaseMap } from './BaseMap';
import { MIN_ZOOM } from './viewState';

const mapProps: { minZoom?: number; maxZoom?: number }[] = [];
vi.mock('./mapboxToken', () => ({ mapboxToken: 'pk.test', hasMapboxToken: true }));
vi.mock('@vis.gl/react-mapbox', () => ({
  Map: (props: { minZoom?: number; maxZoom?: number }) => {
    mapProps.push(props);
    return null;
  },
}));

describe('BaseMap', () => {
  it('passes MIN_ZOOM to the underlying map by default, so no caller has to set it', () => {
    mapProps.length = 0;
    render(<BaseMap />);
    expect(mapProps[0].minZoom).toBe(MIN_ZOOM);
    expect(mapProps[0].maxZoom).toBeUndefined();
  });

  it('lets a caller override minZoom/maxZoom explicitly', () => {
    mapProps.length = 0;
    render(<BaseMap minZoom={5} maxZoom={18} />);
    expect(mapProps[0].minZoom).toBe(5);
    expect(mapProps[0].maxZoom).toBe(18);
  });
});

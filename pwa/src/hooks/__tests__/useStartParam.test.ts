import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createElement, type ReactNode } from 'react';
import { useStartParam } from '../useStartParam';

function wrapper(url: string) {
  return ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [url] }, children);
}

describe('useStartParam', () => {
  it('returns undefined when no params', () => {
    const { result } = renderHook(() => useStartParam(), { wrapper: wrapper('/') });
    expect(result.current.gymId).toBeUndefined();
    expect(result.current.machineId).toBeUndefined();
  });

  it('parses ?equipment=5&gym=2', () => {
    const { result } = renderHook(() => useStartParam(), {
      wrapper: wrapper('/?equipment=5&gym=2'),
    });
    expect(result.current.machineId).toBe('5');
    expect(result.current.gymId).toBe('2');
  });

  it('parses only equipment', () => {
    const { result } = renderHook(() => useStartParam(), {
      wrapper: wrapper('/?equipment=10'),
    });
    expect(result.current.machineId).toBe('10');
    expect(result.current.gymId).toBeUndefined();
  });
});

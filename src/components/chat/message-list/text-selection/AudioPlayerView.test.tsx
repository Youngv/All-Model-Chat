import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { setupProviderTestRenderer } from '@/test/providerTestUtils';
import { AudioPlayerView } from './AudioPlayerView';

describe('AudioPlayerView', () => {
  const renderer = setupProviderTestRenderer({ providers: { language: 'en' } });

  it('uses custom compact controls instead of browser-native audio controls', async () => {
    const audioRef = { current: null } as React.RefObject<HTMLAudioElement>;

    await act(async () => {
      renderer.render(
        <AudioPlayerView
          audioUrl="blob:quick-tts"
          isLoading={false}
          audioRef={audioRef}
          onDragStart={vi.fn()}
          onClose={vi.fn()}
        />,
      );
    });

    const audio = renderer.container.querySelector('audio');
    expect(audio).not.toBeNull();
    expect(audio?.hasAttribute('controls')).toBe(false);
    expect(renderer.container.querySelector('button[aria-label="Play"]')).not.toBeNull();
    expect(renderer.container.querySelector('input[type="range"]')).not.toBeNull();
  });

  it('renders elapsed and duration as separate compact time readouts', async () => {
    const audioRef = { current: null } as React.RefObject<HTMLAudioElement>;

    await act(async () => {
      renderer.render(
        <AudioPlayerView
          audioUrl="blob:quick-tts"
          isLoading={false}
          audioRef={audioRef}
          onDragStart={vi.fn()}
          onClose={vi.fn()}
        />,
      );
    });

    expect(renderer.container.querySelector('[aria-label="Text selection audio player"]')).not.toBeNull();
    expect(renderer.container.querySelectorAll('[data-audio-time-readout]')).toHaveLength(2);
  });

  it('uses a layered player surface and custom progress presentation', async () => {
    const audioRef = { current: null } as React.RefObject<HTMLAudioElement>;

    await act(async () => {
      renderer.render(
        <AudioPlayerView
          audioUrl="blob:quick-tts"
          isLoading={false}
          audioRef={audioRef}
          onDragStart={vi.fn()}
          onClose={vi.fn()}
        />,
      );
    });

    expect(renderer.container.querySelector('[data-audio-player-surface]')).not.toBeNull();
    expect(renderer.container.querySelector('[data-audio-progress-track]')).not.toBeNull();
    expect(renderer.container.querySelector('[data-audio-progress-fill]')).not.toBeNull();
    expect(renderer.container.querySelector('[data-audio-progress-thumb]')).not.toBeNull();
  });
});

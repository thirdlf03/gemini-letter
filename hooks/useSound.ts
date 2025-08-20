
import { useCallback, useMemo } from 'react';
// This assumes Howler is loaded globally from the CDN in index.html
// So we declare it to satisfy TypeScript.
declare const Howl: any;

interface HowlOptions {
  loop?: boolean;
  volume?: number;
}

export const useSound = (src: string, { loop = false, volume = 1.0 }: HowlOptions = {}) => {
  const sound = useMemo(() => {
    return new Howl({
      src: [src],
      loop,
      volume,
    });
  }, [src, loop, volume]);

  const play = useCallback(() => {
    sound.play();
  }, [sound]);

  return play;
};

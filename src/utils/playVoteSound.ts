let audioContext: AudioContext | null = null;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function playVoteSound() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext!)();
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const now = audioContext.currentTime;
    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },
      { freq: 659.25, start: 0.1, duration: 0.22 },
      { freq: 783.99, start: 0.2, duration: 0.28 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const t = now + start;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      oscillator.connect(gain);
      gain.connect(audioContext!.destination);
      oscillator.start(t);
      oscillator.stop(t + duration + 0.05);
    });
  } catch {
    // Audio no disponible en este navegador o contexto.
  }
}

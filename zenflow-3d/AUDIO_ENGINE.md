# Zenflow-3D Web Audio Engine Architecture

## Synthesizer Architecture
The audio pipeline utilizes the native browser `AudioContext` to construct real-time soundscapes without external audio players:

```text
[ HTMLAudioElement ] -> [ MediaElementAudioSourceNode ]
                                    |
                                    v
                            [ GainNode (Linear Fade) ]
                                    |
                                    v
                         [ AudioContext.destination ]
```

## Chime Generator
When timers elapse, the system synthesizes a dual-tone harmonic chime using pure sine waves:
* **Fundamental:** 830 Hz (E5)
* **Harmonic:** 1050 Hz (C6)
* **Decay:** Exponential volume curve over 0.6 seconds (`exponentialRampToValueAtTime`).

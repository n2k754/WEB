"""Original royalty-free promo beat (120 BPM, A minor, 20 s), synthesised with numpy. No samples, no third-party material."""
import numpy as np, wave, sys
SR = 44100; BPM = 120; BEAT = 60 / BPM; DUR = 20.0
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * (1 - max(pan, 0)); R[i:i + len(s)] += s * (1 + min(pan, 0))

def env(n, a=0.002, d=0.2, pw=3.0):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d * pw)

def kick():
    n = int(SR * 0.35); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.25, 2.2) + 0.25 * rng.standard_normal(n) * np.exp(-t * 90)

def clap():
    n = int(SR * 0.25); x = rng.standard_normal(n)
    b = np.convolve(x, np.ones(6) / 6, mode="same")
    t = np.arange(n) / SR
    e = np.exp(-t * 28) * (1 + 0.8 * (np.sin(2 * np.pi * 95 * t) > 0.6))
    return b * e * 0.9

def hat(open_=False):
    n = int(SR * (0.25 if open_ else 0.06)); x = rng.standard_normal(n)
    x = np.diff(x, prepend=0)  # high-pass-ish
    return x * env(n, 0.0005, 0.18 if open_ else 0.03, 4)

def saw(f, n, k=7):
    t = np.arange(n) / SR; s = np.zeros(n)
    for h in range(1, k + 1): s += np.sin(2 * np.pi * f * h * t) / h
    return s

def bass(f, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)) * env(n, 0.005, dur, 1.1) * np.minimum((dur - t) / 0.03, 1).clip(0, 1)

def pluck(f, dur=0.22):
    n = int(SR * dur); s = saw(f, n, 6) + 0.6 * saw(f * 1.004, n, 6)
    return s * env(n, 0.002, 0.14, 3.2) * 0.35

def noise_riser(t0, dur):
    n = int(SR * dur); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.cumsum(np.diff(x, prepend=0)) * 0.0  # placeholder
    sweep = np.diff(x, prepend=0) * (t / dur) ** 2.2
    add(sweep * 0.22, t0, 1.0)

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
roots = [45, 41, 48, 43]            # A, F, C, G (low octave)
arp = {45: [57, 60, 64, 67], 41: [53, 57, 60, 65], 48: [60, 64, 67, 72], 43: [55, 59, 62, 67]}

drop = 4.0
kick_s, clap_s = kick(), clap()
total_beats = int(DUR / BEAT)
side = np.ones(N)
for b in range(total_beats):
    t0 = b * BEAT
    bar = int(t0 // (4 * BEAT)); step = b % 4
    if t0 >= drop - 1e-6 or (t0 >= 2.0 and step in (0,)):
        add(kick_s, t0, 0.95)
        if t0 >= drop - 1e-6:
            i = int(t0 * SR); m = int(0.18 * SR)
            side[i:i + m] *= np.linspace(0.35, 1, min(m, N - i))
    if t0 >= drop - 1e-6 and step in (1, 3): add(clap_s, t0, 0.55, 0.05)
    # hats on 8ths from the drop, open hat off-beat
    if t0 >= 2.0:
        add(hat(), t0, 0.16, -0.2)
        add(hat(), t0 + BEAT / 2, 0.12, 0.2)
        if t0 >= drop and step % 2 == 1: add(hat(True), t0 + BEAT / 2, 0.10, 0.15)

# bass + arp follow A-F-C-G, one chord per bar, from bar 1 (filtered intro) / drop
bars = int(DUR / (4 * BEAT))
bass_l = np.zeros(N); arp_l = np.zeros(N)
for br in range(bars):
    t0 = br * 4 * BEAT; r = roots[br % 4]
    if t0 >= drop - 1e-6:
        for q in range(8):  # offbeat 8th bass
            add(bass(NOTE(r), BEAT / 2 * 0.9), t0 + q * BEAT / 2, 0.55)
    if t0 >= 2.0:
        notes = arp[r]
        for k in range(16):  # 16th arp
            m = notes[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]] + (12 if k % 8 in (3, 5) else 0)
            add(pluck(NOTE(m)), t0 + k * BEAT / 4, 0.38 if t0 >= drop else 0.18, -0.25 if k % 2 else 0.25)

noise_riser(0.0, 4.0)
# impact at the drop
imp = kick()[: int(SR * 0.35)] ; add(imp * 1.2, drop, 0.9)
n = int(SR * 1.2); t = np.arange(n) / SR
add(rng.standard_normal(n) * np.exp(-t * 4) * 0.25, drop, 1.0)

L *= side; R *= side
# gentle tail fade
fade = np.ones(N); f = int(SR * 0.35); fade[-f:] = np.linspace(1, 0, f); L *= fade; R *= fade
peak = max(abs(L).max(), abs(R).max()); L, R = np.tanh(L / peak * 1.6) * 0.9, np.tanh(R / peak * 1.6) * 0.9
out = (np.stack([L, R], 1) * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print("wrote", sys.argv[1], DUR, "s")

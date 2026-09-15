// Two separate short transients, with silence between them. Sustained loud sound is not two claps.
export class ClapDetector {
  constructor() { this.highSince = null; this.first = null; this.floor = .02; }
  sample(level, now) {
    const threshold = Math.max(.2, this.floor * 4);
    if (level > threshold) {
      if (this.highSince === null) this.highSince = now;
      return false;
    }
    this.floor = this.floor * .97 + level * .03;
    if (this.highSince === null) return false;
    const onset = this.highSince, duration = now - onset; this.highSince = null;
    if (duration > 130) { this.first = null; return false; }
    const gap = this.first === null ? Infinity : onset - this.first;
    if (gap >= 160 && gap <= 700) { this.first = null; return true; }
    this.first = onset; return false;
  }
}

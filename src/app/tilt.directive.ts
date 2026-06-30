import { Directive, ElementRef, OnInit, OnDestroy, inject, NgZone } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef).nativeElement as HTMLElement;
  private zone = inject(NgZone);

  private shine!: HTMLDivElement;
  private tx = 0;
  private ty = 0;
  private cx = 0;
  private cy = 0;
  private hovered = false;
  private rafId?: number;

  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseEnterListener?: () => void;
  private mouseLeaveListener?: () => void;

  ngOnInit(): void {
    // Check for reduced motion
    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    this.zone.runOutsideAngular(() => {
      // Inner shine overlay
      this.shine = document.createElement('div');
      this.shine.className = 'tilt-shine';
      this.el.appendChild(this.shine);

      this.mouseMoveListener = (e: MouseEvent) => this.handleMouseMove(e);
      this.mouseEnterListener = () => this.handleMouseEnter();
      this.mouseLeaveListener = () => this.handleMouseLeave();

      this.el.addEventListener('mousemove', this.mouseMoveListener);
      this.el.addEventListener('mouseenter', this.mouseEnterListener);
      this.el.addEventListener('mouseleave', this.mouseLeaveListener);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.mouseMoveListener) {
      this.el.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseEnterListener) {
      this.el.removeEventListener('mouseenter', this.mouseEnterListener);
    }
    if (this.mouseLeaveListener) {
      this.el.removeEventListener('mouseleave', this.mouseLeaveListener);
    }
    if (this.shine) {
      this.shine.remove();
    }
    this.el.style.transform = '';
  }

  private handleMouseMove(e: MouseEvent): void {
    const r = this.el.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    this.tx = dx * 20;
    this.ty = dy * -16;
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    this.shine.style.background =
      `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.18),transparent 55%)`;
  }

  private handleMouseEnter(): void {
    this.hovered = true;
    this.startAnimationLoop();
  }

  private handleMouseLeave(): void {
    this.hovered = false;
    this.tx = 0;
    this.ty = 0;
    this.shine.style.background = 'transparent';
    this.startAnimationLoop();
  }

  private startAnimationLoop(): void {
    if (!this.rafId) {
      const loop = () => {
        if (!this.hovered && Math.abs(this.cx) < 0.05 && Math.abs(this.cy) < 0.05) {
          this.cx = 0;
          this.cy = 0;
          this.el.style.transform = '';
          this.rafId = undefined;
          return;
        }
        this.cx += (this.tx - this.cx) * 0.18;
        this.cy += (this.ty - this.cy) * 0.18;
        this.el.style.transform =
          `perspective(900px) rotateX(${this.cy}deg) rotateY(${this.cx}deg) scale3d(1.025,1.025,1.025)`;
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }
  }
}

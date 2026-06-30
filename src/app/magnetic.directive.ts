import { Directive, ElementRef, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef).nativeElement as HTMLElement;
  private zone = inject(NgZone);

  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseEnterListener?: () => void;
  private mouseLeaveListener?: () => void;

  ngOnInit(): void {
    // Check for reduced motion
    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    this.zone.runOutsideAngular(() => {
      this.mouseEnterListener = () => {
        this.mouseMoveListener = (e: MouseEvent) => {
          const r = this.el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          gsap.to(this.el, {
            x: dx * 0.40,
            y: dy * 0.40,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: true
          });
        };
        window.addEventListener('mousemove', this.mouseMoveListener);
      };

      this.mouseLeaveListener = () => {
        if (this.mouseMoveListener) {
          window.removeEventListener('mousemove', this.mouseMoveListener);
          this.mouseMoveListener = undefined;
        }
        gsap.to(this.el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1,0.4)',
          overwrite: true
        });
      };

      this.el.addEventListener('mouseenter', this.mouseEnterListener);
      this.el.addEventListener('mouseleave', this.mouseLeaveListener);
    });
  }

  ngOnDestroy(): void {
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseEnterListener) {
      this.el.removeEventListener('mouseenter', this.mouseEnterListener);
    }
    if (this.mouseLeaveListener) {
      this.el.removeEventListener('mouseleave', this.mouseLeaveListener);
    }
    gsap.killTweensOf(this.el);
    this.el.style.transform = '';
  }
}

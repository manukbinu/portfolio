import { Component, HostListener, OnDestroy, AfterViewInit, OnInit, signal, computed, inject, NgZone, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, asyncScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import gsap from 'gsap';
import { initEffects } from './effects';
import {
  JNode,
  JStop,
  NAV_LINKS,
  PM_SKILLS,
  TECH_SKILLS,
  EXPERIENCES,
  PROJECTS,
  SOCIAL_LINKS,
  AWARDS,
  JOURNEY_NODES,
  JOURNEY_TOUR
} from './portfolio-data';
import { TiltDirective } from './tilt.directive'; // Standalone Tilt Directive
import { MagneticDirective } from './magnetic.directive'; // Standalone Magnetic Directive

@Component({
  selector: 'app-root',
  imports: [CommonModule, TiltDirective, MagneticDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  menuOpen = signal(false);
  scrolled = signal(false);
  activeSection = signal('hero');
  journeyOpen = signal(false);
  journeyIndex = signal(0);
  waOpen = signal(false);
  private destroyEffects?: () => void;

  navLinks = NAV_LINKS;
  pmSkills = PM_SKILLS;
  techSkills = TECH_SKILLS;
  experiences = EXPERIENCES;
  projects = PROJECTS;
  socialLinks = SOCIAL_LINKS;
  awards = AWARDS;
  journeyNodes = JOURNEY_NODES;
  journeyTour = JOURNEY_TOUR;

  currentStop = computed<JStop>(() => this.journeyTour[this.journeyIndex()]);
  journeyActiveNode = computed<string>(() => this.journeyTour[this.journeyIndex()].node ?? '');

  get linkNodes(): JNode[] { return this.journeyNodes.filter(n => n.id !== 'origin'); }

  ngOnInit(): void {
    this.setupScrollListener();
    this.setupResizeListener();
  }

  ngAfterViewInit(): void {
    // Run canvas and animations outside Angular Zone for peak performance
    this.zone.runOutsideAngular(() => {
      this.destroyEffects = initEffects();
    });
  }

  ngOnDestroy(): void {
    this.destroyEffects?.();
    document.body.classList.remove('journey-lock');
  }

  private setupScrollListener() {
    this.zone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(
          throttleTime(30, asyncScheduler, { leading: true, trailing: true }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          const currentScroll = window.scrollY;
          let hasScrolled = this.scrolled();

          if (currentScroll > 80) {
            hasScrolled = true;
          } else if (currentScroll < 20) {
            hasScrolled = false;
          }
          
          const sections = ['hero', 'about', 'skills', 'experience', 'projects', 'recognition', 'education', 'contact'];
          let currentSection = 'hero';
          for (const id of [...sections].reverse()) {
            const el = document.getElementById(id);
            if (el && window.scrollY >= el.offsetTop - 120) {
              currentSection = id;
              break;
            }
          }

          // Only trigger change detection when there is an actual state change
          if (hasScrolled !== this.scrolled() || currentSection !== this.activeSection()) {
            this.zone.run(() => {
              this.scrolled.set(hasScrolled);
              this.activeSection.set(currentSection);
            });
          }
        });
    });
  }

  private setupResizeListener() {
    this.zone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          throttleTime(100, asyncScheduler, { leading: true, trailing: true }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          if (this.journeyOpen()) {
            this.zone.run(() => {
              this.flyTo(this.journeyIndex(), 0.2);
            });
          }
        });
    });
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu()  { this.menuOpen.set(false); }
  toggleWa()   { this.waOpen.update(v => !v); }

  scrollTo(href: string) {
    this.closeMenu();
    document.getElementById(href.replace('#',''))?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── Journey camera ────────────────────────────────────────────────────────
  openJourney() {
    this.closeMenu();
    this.journeyIndex.set(0);
    this.journeyOpen.set(true);
    document.body.classList.add('journey-lock');
    // Dramatic reveal: start zoomed out on the whole map, then dive into the intro.
    requestAnimationFrame(() => {
      const vw = window.innerWidth, vh = window.innerHeight;
      gsap.set('.journey-canvas', { x: vw / 2 - 1500 * 0.3, y: vh / 2 - 1000 * 0.3, scale: 0.3 });
      setTimeout(() => this.flyTo(0), 60);
    });
  }

  closeJourney() {
    this.journeyOpen.set(false);
    document.body.classList.remove('journey-lock');
  }

  journeyNext() { if (this.journeyIndex() < this.journeyTour.length - 1) this.flyToIndex(this.journeyIndex() + 1); }
  journeyPrev() { if (this.journeyIndex() > 0) this.flyToIndex(this.journeyIndex() - 1); }

  flyToIndex(i: number) { this.journeyIndex.set(i); this.flyTo(i); }

  goToNode(id: string) {
    const i = this.journeyTour.findIndex(s => s.node === id);
    if (i >= 0) this.flyToIndex(i);
  }

  private flyTo(i: number, dur = 1.5) {
    const stop = this.journeyTour[i];
    const n = stop.node ? this.journeyNodes.find(x => x.id === stop.node) : null;
    const x = n ? n.x : (stop.x ?? 1500);
    const y = n ? n.y : (stop.y ?? 1000);
    let S = stop.scale;
    const vw = window.innerWidth, vh = window.innerHeight;

    // Scale S down dynamically on small viewports to keep nodes fully visible
    if (vw < 800) {
      S = S * (vw / 800);
      if (S < 0.25) S = 0.25;
    }

    gsap.to('.journey-canvas', {
      x: vw / 2 - x * S, y: vh / 2 - y * S, scale: S,
      duration: dur, ease: 'power3.inOut', overwrite: true,
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.journeyOpen()) return;
    if (e.key === 'Escape') this.closeJourney();
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.journeyNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.journeyPrev(); }
  }
}

import { Directive, ElementRef, HostListener, HostBinding, Input } from '@angular/core';

const POPOVER_TRIGGER_CLASS = 'popover-trigger--triggered';

@Directive({
  selector: '[appPopoverTrigger]'
})
export class PopoverTriggerDirective {

  private element: HTMLElement;

  private popVisible = false;

  private lastTimeout;

  @Input() delay = 0;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    this.bindClass();
  }

  bindClass() {
    this.element.classList.add('popover-trigger');
  }

  private setPopoverVisibillity(showPop = false) {
    this.popVisible = showPop;

    if (showPop) {
      this.element.classList.add(POPOVER_TRIGGER_CLASS);
    } else {
      this.element.classList.remove(POPOVER_TRIGGER_CLASS);
    }
  }

  @HostListener('mouseover') onHover() {
    if (this.delay > 0) {
      this.lastTimeout = setTimeout(() => {
        this.setPopoverVisibillity(true);
      }, this.delay);

      return;
    }

    this.setPopoverVisibillity(true);
  }

  @HostListener('mouseout') onOut() {
    clearTimeout(this.lastTimeout);
    this.setPopoverVisibillity(false);
  }

}

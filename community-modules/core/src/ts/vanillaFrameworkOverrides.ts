import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { includes } from "./utils/array";

const OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class VanillaFrameworkOverrides implements IFrameworkOverrides {

    // for Vanilla JS, we use simple timeout
    public setTimeout(action: any, timeout?: any): void {
        window.setTimeout(action, timeout);
    }

    public isOutsideAngular = (eventType:string) => includes(OUTSIDE_ANGULAR_EVENTS, eventType);

    // for Vanilla JS, we just add the event to the element
    public addEventListener(element: HTMLElement, type: string,
                            listener: EventListenerOrEventListenerObject,
                            useCapture?: boolean): void {
        element.addEventListener(type, listener, useCapture);
    }

    // for Vanilla JS, we just execute the listener
    dispatchEvent(eventType: string, listener: () => {}): void {
        listener();
    }
}

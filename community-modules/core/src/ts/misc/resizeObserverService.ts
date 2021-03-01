import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { debounce } from "../utils/function";
import { offsetHeight, offsetWidth } from "../utils/dom";

@Bean('resizeObserverService')
export class ResizeObserverService extends BeanStub {

    public observeResize(element: HTMLElement, callback: () => void, debounceDelay: number = 50): () => void {
        // put in variable, so available to usePolyfill() function below
        const frameworkFactory = this.getFrameworkOverrides();
        // this gets fired too often and might cause some relayout issues
        // so we add a debounce to the callback here to avoid the flashing effect.
        const debouncedCallback = debounce(callback, debounceDelay);
        const useBrowserResizeObserver = () => {
            const resizeObserver = new (window as any).ResizeObserver(debouncedCallback);
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        };

        const usePolyfill = () => {

            // initialise to the current width and height, so first call will have no changes
            let widthLastTime = offsetWidth(element);
            let heightLastTime = offsetHeight(element);

            // when finished, this gets turned to false.
            let running = true;

            const periodicallyCheckWidthAndHeight = () => {
                if (running) {

                    const newWidth = offsetWidth(element);
                    const newHeight = offsetHeight(element);

                    const changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }

                    frameworkFactory.setTimeout(periodicallyCheckWidthAndHeight, debounceDelay);
                }
            };

            periodicallyCheckWidthAndHeight();

            // the callback function we return sets running to false
            return () => running = false;
        };

        const suppressResize = this.gridOptionsWrapper.isSuppressBrowserResizeObserver();
        const resizeObserverExists = !!(window as any).ResizeObserver;

        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        } else {
            return usePolyfill();
        }
    }

}

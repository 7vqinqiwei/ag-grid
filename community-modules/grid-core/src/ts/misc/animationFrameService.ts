
import { Autowired, Bean, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AnimationQueueEmptyEvent } from "../events";
import { Events } from "../eventKeys";
import { EventService } from "../eventService";
import { GridPanel } from "../gridPanel/gridPanel";

interface TaskItem {
    task: () => void;
    index: number;
}

@Bean('animationFrameService')
export class AnimationFrameService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    // p1 and p2 are create tasks are to do with row and cell creation.
    // for them we want to execute according to row order, so we use
    // TaskItem so we know what index the item is for.
    private createTasksP1: TaskItem[] = []; // eg drawing back-ground of rows
    private createTasksP2: TaskItem[] = []; // eg cell renderers, adding hover functionality

    // destroy tasks are to do with row removal. they are done after row creation as the user will need to see new
    // rows first (as blank is scrolled into view), when we remove the old rows (no longer in view) is not as
    // important.
    private destroyTasks: (() => void)[] = [];

    private ticking = false;

    private useAnimationFrame: boolean;

    // we need to know direction of scroll, to build up rows in the direction of
    // the scroll. eg if user scrolls down, we extend the rows by building down.
    private scrollGoingDown = true;
    private lastScrollTop = 0;

    private gridPanel: GridPanel;

    public setScrollTop(scrollTop: number): void {
        this.scrollGoingDown = scrollTop > this.lastScrollTop;
        this.lastScrollTop = scrollTop;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private init(): void {
        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();
    }

    // this method is for our ag-Grid sanity only - if animation frames are turned off,
    // then no place in the code should be looking to add any work to be done in animation
    // frames. this stops bugs - where some code is asking for a frame to be executed
    // when it should not.
    private verifyAnimationFrameOn(methodName: string): void {
        if (this.useAnimationFrame === false) {
            console.warn(`ag-Grid: AnimationFrameService.${methodName} called but animation frames are off`);
        }
    }

    public addCreateP1Task(task: () => void, index: number): void {
        this.verifyAnimationFrameOn('addP1Task');
        const taskItem: TaskItem = {task: task, index: index};
        this.createTasksP1.push(taskItem);
        this.schedule();
    }

    public addCreateP2Task(task: () => void, index: number): void {
        this.verifyAnimationFrameOn('addP2Task');
        const taskItem: TaskItem = {task: task, index: index};
        this.createTasksP2.push(taskItem);
        this.schedule();
    }

    public addDestroyTask(task: () => void): void {
        this.verifyAnimationFrameOn('addP3Task');
        this.destroyTasks.push(task);
        this.schedule();
    }

    private executeFrame(millis: number): void {
        this.verifyAnimationFrameOn('executeFrame');

        const p1Tasks = this.createTasksP1;
        const p2Tasks = this.createTasksP2;
        const destroyTasks = this.destroyTasks;

        if (this.scrollGoingDown) {
            const ascSortFunc = (a: TaskItem, b: TaskItem) => b.index - a.index;
            p1Tasks.sort(ascSortFunc);
            p2Tasks.sort(ascSortFunc);
        } else {
            const descSortFunc = (a: TaskItem, b: TaskItem) => a.index - b.index;
            p1Tasks.sort(descSortFunc);
            p2Tasks.sort(descSortFunc);
        }

        const frameStart = new Date().getTime();
        let duration = (new Date().getTime()) - frameStart;

        // 16ms is 60 fps
        const noMaxMillis = millis <= 0;
        while (noMaxMillis || duration < millis) {
            const gridPanelUpdated = this.gridPanel.executeFrame();

            if (!gridPanelUpdated) {
                if (p1Tasks.length) {
                    const taskItem = p1Tasks.pop();
                    taskItem.task();
                } else if (p2Tasks.length) {
                    const taskItem = p2Tasks.pop();
                    taskItem.task();
                } else if (destroyTasks.length) {
                    const task = destroyTasks.pop();
                    task();
                } else {
                    break;
                }
            }

            duration = (new Date().getTime()) - frameStart;
        }

        if (p1Tasks.length || p2Tasks.length || destroyTasks.length) {
            this.requestFrame();
        } else {
            this.stopTicking();
        }
    }

    private stopTicking(): void {
        this.ticking = false;
        const event: AnimationQueueEmptyEvent = {
            type: Events.EVENT_ANIMATION_QUEUE_EMPTY,
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            api: this.gridOptionsWrapper.getApi()
        };
        this.eventService.dispatchEvent(event);
    }

    public flushAllFrames(): void {
        if (!this.useAnimationFrame) { return; }
        this.executeFrame(-1);
    }

    public schedule(): void {
        if (!this.useAnimationFrame) { return; }
        if (!this.ticking) {
            this.ticking = true;
            this.requestFrame();
        }
    }

    private requestFrame(): void {
        // check for the existence of requestAnimationFrame, and if
        // it's missing, then we polyfill it with setTimeout()
        const callback = this.executeFrame.bind(this, 60);
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        } else if (window.webkitRequestAnimationFrame) {
            window.webkitRequestAnimationFrame(callback);
        } else {
            window.setTimeout(callback, 0);
        }
    }

    public isQueueEmpty(): boolean {
        return this.ticking;
    }

}

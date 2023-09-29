
export class EventsAggregator {
    private eventTriggered: boolean = false;
    private staleEventTaskDelayMillis: number = this.aggregateForMillis * 10;
    private eventActionDelayMillis: number = 600;
    private triggerEventTimeoutId: NodeJS.Timeout | null = null;

    constructor(private readonly aggregateForMillis: number, private readonly eventAction: () => any) {
        this.triggerStaleEvent();
    }

    triggerEvent() {
        if (this.triggerEventTimeoutId != null) {
            clearTimeout(this.triggerEventTimeoutId);
        }
        this.eventTriggered = true;
        this.triggerEventTimeoutId = setTimeout(() => {
            this.executeEventActionWithDelayIfNecessary();
        }, this.aggregateForMillis);
    }

    private triggerStaleEvent() {
        setTimeout(() => {
            try {
                this.executeEventActionWithDelayIfNecessary();
            } finally {
                this.triggerStaleEvent();
            }
        }, this.staleEventTaskDelayMillis);
    }

    private executeEventActionWithDelayIfNecessary() {
        if (this.eventTriggered) {
            this.eventTriggered = false;
            setTimeout(() => {
                this.eventAction();
            }, this.eventActionDelayMillis);
        }
    }
}

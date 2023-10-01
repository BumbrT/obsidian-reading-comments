
export class EventsAggregator {
    private eventTriggered: boolean = false;
    private eventActionDelayMillis: number = 600;
    private triggerEventTimeoutId: NodeJS.Timeout | null = null;

    constructor(private readonly aggregateForMillis: number, private readonly eventAction: () => any) {
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

    private executeEventActionWithDelayIfNecessary() {
        if (this.eventTriggered) {
            this.eventTriggered = false;
            setTimeout(() => {
                this.eventAction();
            }, this.eventActionDelayMillis);
        }
    }
}

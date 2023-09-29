
export class EventsAggregator {
    private eventTriggered: boolean = false;
    private staleEventTaskDelayMillis: number = this.aggregateForMillis * 5;

    constructor(private readonly aggregateForMillis: number, private readonly eventAction: () => any) {
        this.triggerStaleEvent();
    }

    triggerEvent() {
        this.eventTriggered = true;
        setTimeout(() => {
            if (this.eventTriggered) {
                this.eventTriggered = false;
                this.eventAction();
            }
        }, this.aggregateForMillis);
    }

    private triggerStaleEvent() {
        setTimeout(() => {
            try {
                if (this.eventTriggered) {
                    this.eventTriggered = false;
                    this.eventAction();
                }
            } finally {
                this.triggerStaleEvent();
            }
        }, this.staleEventTaskDelayMillis);
    }
}

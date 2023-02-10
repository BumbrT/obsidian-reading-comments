
export class EventsAggregator {
    private eventTriggered: boolean = false;

    constructor(private readonly aggregateForMillis: number, private readonly eventAction: () => any) {}
    triggerEvent() {
        this.eventTriggered = true;
        setTimeout(() => {
            if (this.eventTriggered) {
                this.eventTriggered = false;
                this.eventAction();
            }
         }, this.aggregateForMillis);
    }
}

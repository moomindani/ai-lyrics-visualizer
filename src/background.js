export class Background {
    constructor() {
        if (this.constructor === Background) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.isAnimating = true;
    }

    draw() {
        // This method should be overridden by child classes
        throw new Error('draw method must be implemented by child classes');
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
    }
}

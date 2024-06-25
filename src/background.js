export class Background {
    constructor() {
        if (this.constructor === Background) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.isAnimating = true;
        this.isChorus = false;
    }

    draw() {
        // This method should be overridden by child classes
        throw new Error('draw method must be implemented by child classes');
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
    }

    setChorus(isChorus){
        this.isChorus = isChorus;
    }

    beatAnimation() {
        throw new Error('beatAnimation method must be implemented by child classes');
    }
}

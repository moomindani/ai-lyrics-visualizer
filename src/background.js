export class Background {
    constructor() {
        if (this.constructor === Background) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.isAnimating = true;
        this.isChorus = false;
        this.isPreChorus = false;
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

    setPreChorus(isPreChorus){
        this.isPreChorus = isPreChorus;
    }

    beatAnimation() {
        throw new Error('beatAnimation method must be implemented by child classes');
    }

    preChorusAnimation() {
        throw new Error('preChorusAnimation method must be implemented by child classes');
    }

    postChorusAnimation() {
        throw new Error('postChorusAnimation method must be implemented by child classes');
    }

    drawText() {
        throw new Error('drawText method must be implemented by child classes');
    }

    drawNotes() {
        throw new Error('drawNotes method must be implemented by child classes');
    }
}

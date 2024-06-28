export class Background {
    constructor() {
        if (this.constructor === Background) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.isAnimating = true;
        this.isChorus = false;
        this.isPreChorus = false;
        this.colorMain = null;
        this.colorBase = null;
        this.colorAccent = null;
    }

    setColors(colorMain, colorBase, colorAccent) {
        this.colorMain = colorMain;
        this.colorBase = colorBase;
        this.colorAccent = colorAccent;
        console.log("Configured main color: " + colorMain);
        console.log("Configured base color: " + colorBase);
        console.log("Configured accent color: " + colorAccent);
    }

    draw() {
        // This method should be overridden by child classes
        throw new Error('draw method must be implemented by child classes');
    }

    enableAnimation() {
        this.isAnimating = true;
    }

    disableAnimation() {
        this.isAnimating = false;
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

    drawText(text) {
        throw new Error('drawText method must be implemented by child classes');
    }

    drawNotes() {
        throw new Error('drawNotes method must be implemented by child classes');
    }
}

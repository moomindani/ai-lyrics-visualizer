export class Background {
    constructor() {
        if (this.constructor === Background) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.isAnimating = true;
        this.isChorus = false;
        this.isPreChorus = false;
        this.colorMain = "#00aa88";
        this.colorBase = "#0066cc";
        this.colorAccent = "#e12885";
        this.colorEffect = "#00ffff";
    }

    isValidColorCode(colorCode) {
        // 正規表現を使用してカラーコードの形式をチェック
        const colorCodeRegex = /^#[0-9A-Fa-f]{6}$/;
        return colorCodeRegex.test(colorCode);
    }

    setColors(colorMain, colorBase, colorAccent, colorEffect) {
        if (colorMain && this.isValidColorCode(colorMain)) {
            this.colorMain = colorMain;
            console.log("Configured main color: " + colorMain);
        }
        if (colorBase && this.isValidColorCode(colorBase)) {
            this.colorBase = colorBase;
            console.log("Configured base color: " + colorBase);
        }
        if (colorAccent && this.isValidColorCode(colorAccent)) {
            this.colorAccent = colorAccent;
            console.log("Configured accent color: " + colorAccent);
        }
        if (this.colorEffect && this.isValidColorCode(colorEffect)) {
            this.colorEffect = colorEffect;
            console.log("Configured effect color: " + colorEffect);
        }
    }

    draw() {
        // This method should be overridden by child classes
        throw new Error('draw method must be implemented by child classes');
    }

    clear() {
        // This method should be overridden by child classes
        throw new Error('clear method must be implemented by child classes');
    }

    enableAnimation() {
        this.isAnimating = true;
    }

    disableAnimation() {
        this.isAnimating = false;
    }

    setChorus(isChorus) {
        this.isChorus = isChorus;
    }

    setPreChorus(isPreChorus) {
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

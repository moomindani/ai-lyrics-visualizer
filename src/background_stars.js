import {Background} from './background'

// BackgroundStars class
export class BackgroundStars extends Background {
    constructor() {
        super();
        this.stars = [];
        // Initialize stars
    }

    draw() {
        // Implementation for drawing stars
        console.log('Drawing stars background');

        const background = document.querySelector("#background");
        background.classList.add("bg_stars");

        const createStar = () => {
            const starEl = document.createElement("span");
            starEl.className = "star";
            const minSize = 1;
            const maxSize = 2;
            const size = Math.random() * (maxSize - minSize) + minSize;
            starEl.style.width = `${size}px`;
            starEl.style.height = `${size}px`;
            starEl.style.left = `${Math.random() * 100}%`;
            starEl.style.top = `${Math.random() * 100}%`;
            starEl.style.animationDelay = `${Math.random() * 10}s`;
            background.appendChild(starEl);
        };

        for (let i = 0; i <= 500; i++) {
            createStar();
        }
    }
}
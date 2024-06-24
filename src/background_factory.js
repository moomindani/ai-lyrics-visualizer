import {BackgroundFuture} from './background_future'
import {BackgroundStars} from './background_stars'

export function createBackground(type) {
    switch (type) {
        case 'stars':
            return new BackgroundStars();
        case 'future':
            return new BackgroundFuture();
        default:
            throw new Error('Invalid background type');
    }
}

export function clearBackground() {
    const background = document.querySelector("#background");
    while (background.firstChild) {
        background.removeChild(background.firstChild);
    }
}
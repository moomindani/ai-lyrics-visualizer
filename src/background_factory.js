import {BackgroundFuture} from './background_future'
import {BackgroundStars} from './background_stars'
import {BackgroundRain} from './background_rain'

export function createBackground(type) {
    switch (type) {
        case 'stars':
            return new BackgroundStars();
        case 'future':
            return new BackgroundFuture();
        case 'rain':
            return new BackgroundRain();
        default:
            throw new Error('Invalid background type');
    }
}

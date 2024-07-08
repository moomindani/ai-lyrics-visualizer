import {BackgroundFuture} from './background_future'

export function createBackground(type) {
    switch (type) {
        case 'future':
            return new BackgroundFuture();
        default:
            throw new Error('Invalid background type');
    }
}

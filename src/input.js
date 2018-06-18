
export class Input {
    constructor() {
        const keys = this.keys = {};
        const keyCodes = this.keyCodes = {};
        document.addEventListener('keydown', e => {
            keys[e.key] = keyCodes[e.keyCode] = true;
        });

        document.addEventListener('keyup', e => {
            keys[e.key] = keyCodes[e.keyCode] = false;
        });
    }
}


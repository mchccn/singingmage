export class SingingMage {
    start_time = -1;
    lyrics = [];
    output = undefined;
    done = undefined;

    static instances = [];

    killed = false;

    constructor(fn, done) {
        this.output = fn;
        this.done = done;

        SingingMage.instances.unshift(this);
    }

    /**
     * Queues a line to be sung.
     * @param {string} line The line to sing.
     * @param {number} delay The delay in milliseconds before the line is sung.
     */
    read(line, delay = 0) {
        return this.lyrics.push([line, delay]);
    }

    sing(dt = 0) {
        if (this.killed) {
            this.lyrics = [];
            this.start_time = -1;
            this.output = undefined;

            return;
        }

        const [line, delay] = this.lyrics.shift();

        if (typeof line === "undefined") return;

        this.start_time = Date.now();

        setTimeout(() => {
            this.output(line);

            if (!this.lyrics.length) {
                if (this.done) this.done();

                return;
            }

            this.sing(Date.now() - (this.start_time + delay));
        }, delay - dt);
    }
}

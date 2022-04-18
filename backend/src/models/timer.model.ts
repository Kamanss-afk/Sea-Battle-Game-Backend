export class Timer {
  id: NodeJS.Timer | undefined;
  done: boolean;
  duration: number;

  constructor() {
    this.id = undefined;
    this.done = false;
    this.duration = 30;
  }

  public start(fn: (duration: number, done: boolean) => void) {
    let timerId = setInterval(() => {
      const done = this.duration === 0;

      fn(this.duration, done);
      this.duration -= 1;

      if(done) {
        this.reset();
      };
    }, 1000);

    this.id = timerId;
  }

  public reset() {
    if(this.id) {
      this.duration = 30;
    }
  }

  public stop() {
    if(this.id) {
      clearInterval(this.id);
    }
  }
}
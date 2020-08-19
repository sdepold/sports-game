import Player from "./player";
import UI from "./ui";
import workConfig from '../config/work.json';
import workoutConfig from '../config/workout.json';

const minutesPerTick = 1;
const staminaPerTick = 0.01;
const tickDelay = 33;

export default class Game {
  constructor() {
    this.player = new Player();
    this.ui = new UI();
    this.time = { day: 0, hours: 0, minutes: 0 };
    this.state = {
      renderWorkMenu: false,
      busy: false,
    };
  }

  increaseTime() {
    this.time.minutes += minutesPerTick;

    if (this.time.minutes >= 60) {
      this.time.hours += 1;
      this.time.minutes = 0;
    }

    if (this.time.hours >= 24) {
      this.time.day += 1;
      this.time.minutes = this.time.hours = 0;
    }
  }

  run() {
    setInterval(() => {
      this.increaseTime();

      if (!this.state.busy) {
        this.player.updateStat("stamina", -staminaPerTick);
      }

      this.ui.updateStats(this.player);
      this.ui.updateTime(this.time);

      this.checkCurrentWork();

      this.state.renderWorkMenu
        ? this.ui.updateWork(workConfig, (item) => this.onWork(item))
        : this.ui.clearWork(workConfig, () => {
            this.state.renderWorkMenu = true;
          });
    }, tickDelay);

    this.ui.updateStats(this.player);
    this.ui.updateTime(this.time);
  }

  onWork(chosenWorkItem) {
    workConfig.items.forEach((workItem) => {
      workItem.current = false;

      if (workItem.title === chosenWorkItem.title) {
        workItem.current = true;
        workItem.investedTime = 0;
        this.state.busy = true;
      }
    });
  }

  checkCurrentWork() {
    const currentWork = workConfig.items.find((i) => i.current);

    if (currentWork) {
      currentWork.investedTime += minutesPerTick;

      if (currentWork.investedTime >= currentWork.requirements.time) {
        delete currentWork.investedTime;
        currentWork.current = false;
        this.state.renderWorkMenu = this.state.busy = false;

        Object.keys(currentWork.effects).forEach(prop => {
          this.player.updateStat(prop, currentWork.effects[prop]);
        })
      }
    }
  }
}

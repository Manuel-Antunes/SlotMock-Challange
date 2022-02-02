import Machine from './slots/Machine';
import GuessInput from './ui/GuessInput';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  @property(cc.EditBox)
  randomValueBox: cc.EditBox = null;

  @property(cc.Node)
  machine: cc.Node = null;

  @property(cc.Integer)
  initalValue = 0;

  machineElement: Machine;

  @property(GuessInput)
  guessInput: GuessInput = null;

  @property({ type: cc.AudioClip })
  audioClick = null;

  private block = false;

  private result = null;

  start(): void {
    this.machine.getComponent('Machine').createMachine();
    this.machine.getComponent(Machine).coins = this.initalValue;
  }

  update(): void {
    if (this.block && this.result != null) {
      this.informStop();
      this.result = null;
      this.guessInput.node.active = true;
      this.randomValueBox.node.active = true;
    }
  }

  click(): void {
    cc.audioEngine.playEffect(this.audioClick, false);
    const percent = parseInt(this.randomValueBox.string, 10);
    if (
      this.guessInput.value &&
      this.guessInput.value > 0 &&
      this.guessInput.value <= this.machine.getComponent('Machine').coins &&
      // eslint-disable-next-line no-restricted-globals
      !isNaN(percent) &&
      percent >= 0 &&
      percent <= 100
    ) {
      this.guessInput.node.active = false;
      this.randomValueBox.node.active = false;
      if (this.machine.getComponent('Machine').spinning === false) {
        this.block = false;
        this.machine.getComponent('Machine').spin(this.guessInput.value);
        this.requestResult();
      } else if (!this.block) {
        this.block = true;
        this.machine.getComponent('Machine').lock();
      }
    }
  }

  async requestResult(): Promise<void> {
    this.result = null;
    this.result = await this.getAnswer();
  }

  getAnswer(): Promise<Array<Array<number>>> {
    return new Promise<Array<Array<number>>>(resolve => {
      setTimeout(() => {
        const a = this.generatePattern();
        resolve(a);
      }, 1000 + 500 * Math.random());
    });
  }

  informStop(): void {
    const resultRelayed = this.result;
    this.machine.getComponent('Machine').stop(resultRelayed);
  }

  // the main function used to generate the final sequence following some pattern
  generatePattern(): Array<Array<number>> {
    const percent = parseInt(this.randomValueBox.string, 10);
    // this function should generate a complete random array to ensure that the first pattern to be used
    const arr = this.generateFullDiferentArray();
    if (percent <= 50) {
      return arr;
    }
    if (percent > 50 && percent <= 83) {
      return this.generatePatternedArray(1, arr);
    }
    if (percent > 83 && percent <= 93) {
      return this.generatePatternedArray(2, arr);
    }
    return this.generatePatternedArray(3, arr);
  }

  // an auxiliary function to order the array into the given pattern
  generatePatternedArray(
    qtd: number,
    arr: Array<Array<number>>
  ): Array<Array<number>> {
    const result = arr;
    const where = [];
    for (let i = 0; i < qtd; i += 1) {
      let test;
      let alx;
      do {
        test = false;
        alx = Math.ceil(Math.random() * 3) - 1;
        if (where.indexOf(alx) !== -1) {
          test = true;
        }
      } while (test);
      where.push(alx);
      const what = Math.ceil(Math.random() * 21) - 1;
      for (let j = 0; j < 5; j += 1) {
        result[j][where[i]] = what;
      }
    }
    return result;
  }

  // this function it's used to generate an array who doesn't attend to no wich patten
  generateFullDiferentArray(): Array<Array<number>> {
    const arr = [[], [], [], [], []];
    for (let cont = 0; cont < 3; cont += 1) {
      let test = true;
      const result: Array<number> = [];
      do {
        for (let i = 0; i < 5; i += 1) {
          result.push(Math.ceil(Math.random() * 21) - 1);
        }
        for (let i = 0; i < 5; i += 1) {
          if (result[i] !== result[i + 1]) {
            test = false;
            break;
          }
        }
      } while (test === true);
      for (let i = 0; i < 5; i += 1) {
        arr[i].push(result[i]);
      }
    }
    return arr;
  }
}

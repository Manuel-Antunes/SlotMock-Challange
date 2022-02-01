import Machine from "./slots/Machine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

  @property(cc.Integer)
  random:number = 100;

  @property(cc.Node)
  machine: cc.Node = null;

  @property(cc.Integer)
  initalValue = 0;

  machineElement: Machine;

  @property(cc.EditBox)
  editBox:cc.EditBox = null;

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
      this.editBox.node.active = true;
    }
  }

  click(): void {
    cc.audioEngine.playEffect(this.audioClick, false);
    const givenGuessValue = parseInt(this.editBox.string,10);
    if(!isNaN(givenGuessValue) && givenGuessValue <= this.machine.getComponent('Machine').coins){
      this.editBox.node.active = false;
      if (this.machine.getComponent('Machine').spinning === false) {
        this.block = false;
        this.machine.getComponent('Machine').spin(givenGuessValue);
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
    const percent =  this.random;
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
  generatePatternedArray(qtd: number, arr: Array<Array<number>>): Array<Array<number>> {
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

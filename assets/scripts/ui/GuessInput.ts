const { ccclass, property } = cc._decorator;

@ccclass
export default class GuessInput extends cc.Component {
  @property(cc.Integer)
  private _value = 0;

  private _maxValue = 1000;

  private get valueLabel(): cc.Node {
    return this.node.getChildByName('value-label');
  }

  get maxValue(): number {
    return this._maxValue;
  }

  set maxValue(value: number) {
    if (value > 0) {
      if (this.value > value) {
        this.value = value;
      }
      this.value = value;
    }
  }

  @property(cc.Integer)
  public get value(): number {
    return this._value;
  }

  public increase(): void {
    this.value += 10;
  }

  public decrease(): void {
    if (this.value - 10 >= 0) {
      this.value -= 10;
    }
  }

  @property(cc.Integer)
  public set value(value: number): void {
    this.valueLabel.getComponent(cc.Label).string = `${value}`;
    this._value = value;
  }
}

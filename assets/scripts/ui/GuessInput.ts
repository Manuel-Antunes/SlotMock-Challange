const { ccclass, property } = cc._decorator;

@ccclass
export default class GuessInput extends cc.Component {
  @property(cc.Integer)
  private _value = 0;

  private get valueLabel(): cc.Node {
    return this.node.getChildByName('value-label');
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

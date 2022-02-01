import Aux from '../SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Machine extends cc.Component {
  @property(cc.Node)
  public button: cc.Node = null;

  @property(cc.Node)
  public popUpLabel: cc.Node = null;

  @property(cc.Node)
  public coinsLabel: cc.Node = null;

  @property(cc.Prefab)
  public _reelPrefab = null;

  private bet?: number;

  public _coins = 1000;

  get coins(): number {
    return this._coins;
  }

  set coins(coins: number) {
    this.coinsLabel.getComponent(cc.Label).string = `x ${coins}`;
    this._coins = coins;
  }

  @property({ type: cc.Prefab })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property({ type: cc.Integer })
  public _numberOfReels = 3;

  @property({ type: cc.Integer, range: [3, 6], slide: true })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;

    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }

  private reels = [];

  public spinning = false;

  public checking = false;

  createMachine(): void {
    this.node.destroyAllChildren();
    this.reels = [];
    this.coins = 1000;
    this.popUpLabel.active = false;
    let newReel: cc.Node;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      const reelScript = newReel.getComponent('Reel');
      reelScript.shuffle();
      reelScript.reelAnchor.getComponent(cc.Layout).enabled = false;
    }

    this.node.getComponent(cc.Widget).updateAlignment();
  }

  spin(bet:number): void {
    this.bet = bet;
    this.popUpLabel.active = false;
    this.spinning = true;
    this.button.getChildByName('Label').getComponent(cc.Label).string = 'STOP';

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent('Reel');

      if (i % 2) {
        theReel.spinDirection = Aux.Direction.Down;
      } else {
        theReel.spinDirection = Aux.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  lock(): void {
    this.button.getComponent(cc.Button).interactable = false;
  }

  stop(result: Array<Array<number>> = null): void {
    setTimeout(() => {
      this.spinning = false;
      this.button.getComponent(cc.Button).interactable = true;
      this.checking = true;
      this.getThePatternFromScreen();
      this.button.getChildByName('Label').getComponent(cc.Label).string = 'SPIN';
    }, 2500);
    const rngMod = Math.random() / 2;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent('Reel');

      setTimeout(() => {
        theReel.readyStop(result[i]);
      }, spinDelay * 1000);
    }
  }

  // when the game end this function is used to calculate the player generated points and to perform the animations
  getThePatternFromScreen(): void {
    const array = this.reels.map((r: cc.Node) => {
      const a: Array<cc.Node> = r.getComponent('Reel').tiles;
      a.sort((as, b) => b.y - as.y);
      // my logic consists in uses an auxiliary variable called index who references the tile texture to check the results
      // but, the function used to set the tiles is asynchronous and to sort the tiles into a default pattern i use the tile height to check there indexes
      return a.filter((t: cc.Node) => {
        if (t.y < 288 && t.y > -288) {
          return t;
        }
      });
    });
    this.applyRules(array);
  }

  // this function is called when the array is sorted and it's performed the final verification
  // attending all rules from my slot machine, and calculate my earned points
  applyRules(arr: Array<Array<cc.Node>>): void {
    let points = 0;
    for (let i = 0; i < 3; i += 1) {
      const test = this.checkWinningRow(arr, i);
      if (test) {
        for (let j = 0; j < arr.length; j += 1) {
          // eslint-disable-next-line no-param-reassign
          arr[j][i].getComponent('Tile').glowing = true;
        }
        for (let k = i - 1; k >= 0; k -= 1) {
          if (
            this.checkWinningRow(arr, k) &&
            arr[0][k].getComponent('Tile').index === arr[0][i].getComponent('Tile').index
          ) {
            points += 3;
          }
        }
        points += 1;
      }
    }
    this.coins += (points * this.coins)/100;
    if(points === 0){
      this.coins -= this.bet;
    }
    this.handleMessagePopUp(points);
  }

  // when all rules were verifieds now i can display a message to the player to notify him about the last game
  handleMessagePopUp(points: number): void {
    const label = this.popUpLabel.getComponent(cc.Label);
    if (points === 0) {
      label.string = 'too bad';
    } else if (points === 1) {
      label.string = '1 row 1 point';
    } else if (points === 2) {
      label.string = '2 at row';
    } else if (points === 3) {
      label.string = 'full diferent';
    } else if (points === 6) {
      label.string = 'twins rows on fire';
    } else if (points === 7) {
      label.string = 'nice combo!';
    } else {
      label.string = 'perfect';
    }
    this.popUpLabel.active = true;
    this.popUpLabel.getComponent(cc.Animation).play('grow');
  }

  checkWinningRow(arr: Array<Array<cc.Node>>, row: number): boolean {
    let test = true;
    for (let j = 0; j < arr.length - 1; j += 1) {
      if (arr[j][row].getComponent('Tile').index !== arr[j + 1][row].getComponent('Tile').index) {
        test = false;
        break;
      }
    }
    return test;
  }
}

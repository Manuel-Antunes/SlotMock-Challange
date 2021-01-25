const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  @property({ type: [cc.SpriteFrame], visible: true })
  private textures = [];

  @property(cc.Prefab)
  public GlowingContainer: cc.Prefab = null;

  async onLoad(): Promise<void> {
    await this.loadTextures();
    this.createTile();
  }

  // an alxiliary variable used to play the glowing animation
  @property
  _glowing = false;

  createTile(): void {
    this.glowing = false;
  }

  public index: number = null;

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
  }

  @property
  get glowing(): boolean {
    return this._glowing;
  }

  set glowing(isGlowing: boolean) {
    if (isGlowing === true) {
      this.startToGlow();
      this._glowing = isGlowing;
    } else if (this.node) {
      this.node.removeAllChildren();
      this._glowing = isGlowing;
    }
  }

  startToGlow(): void {
    const glowingContainer = cc.instantiate(this.GlowingContainer);
    this.node.addChild(glowingContainer, -1);
  }

  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        self.textures = loadedTextures;
        resolve(true);
      });
    });
  }

  setTile(index: number): void {
    this.index = index;
    this.node.getComponent(cc.Sprite).spriteFrame = this.textures[index];
  }

  setRandom(): void {
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    this.setTile(randomIndex);
  }
}

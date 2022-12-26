import Character from "../Character";

export default class Bowman extends Character {
  constructor(level) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
    this.moveOffset = 2;
    this.attackOffset = 2;
  }
}

import Character from "../Character";

export default class Swardsman extends Character {
  constructor(level) {
    super(level);
    this.attack = 40;
    this.defence = 10;
    this.type = 'swordsman';
    this.moveOffset = 4;
    this.attackOffset = 1;
  }
}

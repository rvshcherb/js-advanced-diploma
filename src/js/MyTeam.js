import Team from "./Team";
import { generateTeam } from "./generators";

import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";

export default class MyTeam extends Team {
  constructor() {
    super();
    this.sideOffset = 0;
    this.allowedTypes = [Bowman, Swordsman, Magician];
  }

  createTeam() {
    this.unpositionedCharacters = generateTeam(this.allowedTypes, {
      maxLevel: 2,
      characterCount: 4,
    });
  }

  upgrade() {
    this.characters.forEach((element) => {
      const attack = Math.max(element.character.attack, element.character.attack * ((80 + element.character.health) / 100));
      element.character.attack = attack;

      const health = (element.character.health + 80) > 100 ? 100 : element.character.health + 80;
      element.character.health = health;

      const level = element.character.level + 1;
      element.character.level = level;
    });

    const upgradedUnits = this.characters.map((unit) => unit.character);
    this.placeCharacters(upgradedUnits);

    const newUnitsNumber = 4 - this.characters.length;
    const extraUnits = generateTeam(this.allowedTypes, {
      maxLevel: 2,
      characterCount: newUnitsNumber,
    });
    const positionedExtraUnits = this.generatePositions(extraUnits);
    positionedExtraUnits.forEach((unit) => this.characters.push(unit));
  }
}

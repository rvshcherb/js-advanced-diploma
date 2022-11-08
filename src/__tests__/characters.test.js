import Character from '../js/Character.js';
import Bowman from "../js/characters/Bowman";
import Swardsman from "../js/characters/Swordsman";
import Magician from "../js/characters/Magician";
import Daemon from "../js/characters/Daemon";
import Vampire from "../js/characters/Vampire";
import Undead from "../js/characters/Undead";

test('New Character should throw exceprion', () => {
  expect(() => new Character()).toThrowError();
})

describe.each([
  [Bowman, 2, 25, 25, 50, 'bowman'],
  [Swardsman, 2, 40, 10, 50, 'swordsman'],
  [Magician, 2, 10, 40, 50, 'magician'],
  [Vampire, 2, 25, 25, 50, 'vampire'],
  [Undead, 2, 40, 10, 50, 'undead'],
  [Daemon, 2, 10, 10, 50, 'daemon'],
])('description', (characterClass, level, attack, defence, health, type) => {
  test(`testing ${characterClass.name}`, () => {
    const character = new characterClass(level);

    expect(character).toHaveProperty('level', 2)
    expect(character).toHaveProperty('attack', attack)
    expect(character).toHaveProperty('defence', defence)
    expect(character).toHaveProperty('health', health)
    expect(character).toHaveProperty('type', type)
  })
})

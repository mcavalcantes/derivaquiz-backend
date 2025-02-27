/* generates a integer in the inclusive range [1, bound] */
function getRandomInteger(bound) {
  return 1 + Math.floor(bound * Math.random());
}

module.exports = getRandomInteger;

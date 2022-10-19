const chains = Object.freeze({
  polkadot: "polkadot",
  kusama: "kusama",
  statemine: "statemine",
  statemint: "statemint",
  westmint: "westmint",
  litentry: "litentry",
  litmus: "litmus",
});

const ss58Format = Object.freeze({
  [chains.polkadot]: 0,
  [chains.kusama]: 2,
  [chains.statemine]: 2,
  [chains.statemint]: 0,
  [chains.westmint]: 42,
  [chains.litentry]: 31,
  [chains.litmus]: 131,
});

function getSs58Format(chain) {
  return ss58Format[chain];
}

module.exports = {
  chains,
  getSs58Format,
};
import litentry from "./litentry";
import statemine from "./statemine";
import statemint from "./statemint";
import westmint from "./westmint";
import litmus from "./litmus";
import westendCollectives from "./westendCollectives";
import collectives from "./collectives";
import kusama from "./kusama";
import polkadot from "./polkadot";
import shadow from "./shadow";

const chains = {
  kusama,
  polkadot,
  litentry,
  litmus,
  statemine,
  statemint,
  westmint,
  "westend-collectives": westendCollectives,
  collectives,
  // "hydradx-testnet": hydradxTestnet,
  // polimec,
  shadow,
};

export default chains;

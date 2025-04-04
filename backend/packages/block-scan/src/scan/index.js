const { startJobs } = require("../jobs");
const { deleteAllUnFinalizedData } = require("./unFinalized/delete");
const { deleteFrom } = require("../mongo/services/delete");
const { updateUnFinalized } = require("./unFinalized");
const { batchInsertCalls } = require("../mongo/services/call");
const { batchInsertExtrinsics } = require("../mongo/services/extrinsic");
const { batchInsertEvents } = require("../mongo/services/event");
const { insertBlock } = require("../mongo/services/block");
const { normalizeBlock } = require("./block");
const { normalizeEvents } = require("./event");
const { normalizeExtrinsics } = require("./extrinsic");
const {
  chain: { getBlockIndexer, getLatestFinalizedHeight, wrapBlockHandler },
  scan: { oneStepScan },
  utils: { sleep },
  env: { currentChain },
  logger,
} = require("@osn/scan-common");
const {
  utils: { getFixedBlockIndexer },
} = require("@statescan/common");
const {
  block: { getBlockDb },
} = require("@statescan/mongo");
const { isSimpleMode } = require("../env");
const { handleEvents } = require("./events");

async function handleBlock({ block, author, events, height }) {
  let blockIndexer = getBlockIndexer(block);
  blockIndexer = getFixedBlockIndexer(blockIndexer, block, currentChain());

  const normalizedBlock = normalizeBlock(block, author, events, blockIndexer);
  const normalizedEvents = normalizeEvents(events, blockIndexer);
  const { normalizedExtrinsics, normalizedCalls } = await normalizeExtrinsics(
    block.extrinsics,
    events,
    blockIndexer,
  );

  const finalizedHeight = getLatestFinalizedHeight();
  if (!isSimpleMode() || height >= finalizedHeight - 100) {
    await insertBlock(normalizedBlock);
  }
  await batchInsertExtrinsics(normalizedExtrinsics);
  await batchInsertEvents(normalizedEvents);
  await batchInsertCalls(normalizedCalls);

  await handleEvents(events, blockIndexer, block.extrinsics);

  const db = getBlockDb();
  await db.updateScanHeight(height);

  if (height >= finalizedHeight - 100) {
    await updateUnFinalized(height);
  }
}

async function ignoreErrorForChains(arg) {
  if (["westmint"].includes(currentChain())) {
    await handleBlock(arg);
    return;
  }

  try {
    await handleBlock(arg);
  } catch (e) {
    logger.error(`${arg?.height} scan error, but ignore`, e);
  }
}

async function scan() {
  const db = getBlockDb();
  let toScanHeight = await db.getNextScanHeight();
  await deleteFrom(toScanHeight);

  const finalizedHeight = getLatestFinalizedHeight();
  if (toScanHeight < finalizedHeight - 100) {
    await deleteAllUnFinalizedData();
  } else if (toScanHeight >= finalizedHeight) {
    await updateUnFinalized(toScanHeight);
  }
  startJobs();

  /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
  while (true) {
    toScanHeight = await oneStepScan(
      toScanHeight,
      wrapBlockHandler(ignoreErrorForChains),
      true,
    );
    await sleep(1);
  }
}

module.exports = {
  handleBlock,
  scan,
};

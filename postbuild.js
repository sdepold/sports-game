const fs = require("fs");
const archiver = require("archiver");
const { execFile } = require("child_process");

fs.unlinkSync("./dist/main.js");

const zipDist = "./dist/build.zip";
let output = fs.createWriteStream(zipDist);
let archive = archiver("zip", {
  zlib: { level: 9 }, // set compression to best
});

const MAX = 13 * 1024; // 13kb

output.on("close", function () {
  let bytes = archive.pointer();
  let percent = ((bytes / MAX) * 100).toFixed(2);

  console.log(`Normal zip size: ${bytes} bytes (${percent}%)`);
  execFile("./bin/ect", ["-9", "-zip", zipDist], (err) => {
    const stats = fs.statSync(zipDist);
    bytes = stats.size;
    percent = ((bytes / MAX) * 100).toFixed(2);

    if (bytes > MAX) {
      console.error(`ect size overflow: ${bytes} bytes (${percent}%)`);
    } else {
      console.log(`ect size: ${bytes} bytes (${percent}%)`);
    }
  });
});

archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on("error", function (err) {
  throw err;
});

let html = fs.readFileSync("./dist/index.html").toString();

[
  "applyItemEffects",
  "hideIfRequirementsNotMet",
  "requirementsFulfilled",
  "changeDifficulty",
  "requiredExperience",
  "updateLevelStat",
  "textSize",
  "currentStats",
  "updateStat",
  "maxStamina",
  "blockMovement",
  "spawnTarget",
  "spawnDelay",
  "enemySpeed",
  "changeDifficulty",
  "remainingTime",
  "renderSpaceHint",
  "completionTriggered",
  "scoreCanvas",
  "startCanvas",
  "originalPlayerPosition",
  "controlsToCharMap",
  "playAudio",
  "playConfused",
  "playLevelUp",
  "selectedItemIndex"
].forEach((token, i) => {
  html = html.replace(new RegExp(token, "g"), `a${i}`);
});

fs.writeFileSync("./dist/index.html", html);

archive.pipe(output);
archive.append(fs.createReadStream("./dist/index.html"), {
  name: "index.html",
});

try {
  fs.unlinkSync("./index.html");
} catch (e) {}
fs.copyFileSync("./dist/index.html", "index.html");

archive.finalize();

// window.onload = function () {
//   GeneralModule.initRoulette();
//   layoutModule.init({
//     eventPlay: sortear,
//   });
//   new WordShuffler(document.getElementById("txtTitle_btc"), {
//     textColor: "#000",
//     timeOffset: 5,
//   });

//   const btnCopy = document.getElementById("btnCopy");

//   btnCopy.addEventListener("click", async (event) => {
//     const link = document.getElementById("aHash").href;
//     copyTextToClipboard(link);
//     if (!btnCopy.classList.contains("animate")) {
//       btnCopy.classList.add("animate");
//       setTimeout(() => {
//         btnCopy.classList.remove("animate");
//       }, ANIMATE_TIMEOUT);
//     }
//   });
// };

let aa;

import LayoutModule from "./layout.js";
import Utils from "./utils.js";
import { Globals } from "./globals.js";
import imgBtc from "/assets/btc2.png";

console.log(Globals);

const GeneralModule = (() => {
  const ANIMATE_TIMEOUT = 1500;

  // Globals.array_concursantes = Globals.array_concursantes_test;

  function initRoulette() {
    let canvas = document.getElementById("idcanvas");
    let context = canvas.getContext("2d");
    let center = canvas.width / 2;

    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, center, 0, 2 * Math.PI);
    context.lineTo(center, center);
    context.fillStyle = "#e5e7eb";
    context.fill();

    if (!Globals.array_concursantes.length) {
      const base_image = new Image();
      base_image.src = imgBtc;
      base_image.onload = function () {
        context.drawImage(base_image, 100, 171);
      };
      // context.drawImage(base_image, 100, 100);
    }

    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, center - 10, 0, 2 * Math.PI);
    context.lineTo(center, center);
    context.fillStyle = "black";
    context.fill();

    for (var i = 0; i < Globals.array_concursantes.length; i++) {
      context.beginPath();
      context.moveTo(center, center);
      context.arc(
        center,
        center,
        center - 20,
        (i * 2 * Math.PI) / Globals.array_concursantes.length,
        ((i + 1) * 2 * Math.PI) / Globals.array_concursantes.length
      );
      context.lineTo(center, center);
      context.fillStyle = random_color();
      context.fill();

      context.save();
      context.translate(center, center);
      context.rotate(
        (3 * 2 * Math.PI) / (5 * Globals.array_concursantes.length) +
          (i * 2 * Math.PI) / Globals.array_concursantes.length
      );
      context.translate(-center, -center);
      context.font = "13px monospace";
      context.textAlign = "right";
      context.fillStyle = "white";
      context.fillText(
        Globals.array_concursantes[i],
        canvas.width - 30,
        center
      );
      context.restore();
      // if (i == 2) break;
    }
  }

  function radiansToDegree(radians) {
    return (radians * 180) / Math.PI;
  }

  let pos_ini = 0;
  let clic = 0;
  let movement;
  const getAngleUnit = () =>
    radiansToDegree((2 * Math.PI) / Globals.array_concursantes.length);

  Globals.angleInit = 270;
  Globals.angle = Globals.angleInit;
  Globals.angleWaiting = 0;

  const getAngleWinner = (numWinner, angle) => {
    if (numWinner >= Globals.array_concursantes.length)
      throw new Error(
        `The winners number (${numWinner}) overtake the maximun quatity of players (${Globals.array_concursantes.length})`
      );

    const angleUnit = getAngleUnit();
    const realNumber = Globals.array_concursantes.length - numWinner;
    const angleTotal = angle + realNumber * angleUnit;
    const iterations = Math.floor(angleTotal / 360);
    const angleFinal = (angleTotal / 360 - iterations) * 360 - angleUnit / 2;

    return angleFinal;
  };

  const animateRotation = (canvas, angleWinner, dataPlayed) => {
    const spinning = [{ transform: `rotate(${angleWinner}deg)` }];
    const timing = {
      duration: 4000,
      easing: "ease-out",
      iterations: 1,
    };
    let animate = canvas.animate(spinning, timing);

    animate.onfinish = (e) => {
      canvas.style.transform = spinning[0].transform;
      LayoutModule.onPlayed(dataPlayed);
    };
  };

  async function sortear() {
    let canvas = document.getElementById("idcanvas");
    let isGenerateNumber = false;
    let dataPlayed = null;

    movement = setInterval(function () {
      Globals.angleWaiting += 30;

      if (isGenerateNumber) {
        clearInterval(movement);
        Globals.angle = Math.floor(getAngleWinner(numberWinner, Globals.angle));
        animateRotation(canvas, Globals.angle, dataPlayed);
      } else canvas.style.transform = "rotate(" + Globals.angleWaiting + "deg)";
    }, 10);

    const txData = await BTCTx.getTx();
    const txHash = txData.hash;
    const numberWinner = await generateNumberFromTX(
      txHash,
      Globals.array_concursantes.length
    );
    isGenerateNumber = true;

    dataPlayed = {
      numberWinner,
      txHash,
      txTime: txData.time,
      timeIniTx: BTCTx.timeIniTx,
      timeEndTx: BTCTx.timeEndTx,
      winner: Globals.array_concursantes[numberWinner],
    };

    return dataPlayed;
  }

  function random_color() {
    let ar_digit = ["2", "3", "4", "5", "6", "7", "8", "9"];
    let color = "";
    let i = 0;
    while (i < 6) {
      let pos = Math.round(Math.random() * (ar_digit.length - 1));
      color = color + "" + ar_digit[pos];
      i++;
    }
    return "#" + color;
  }

  const MAX_BYTES_TO_CALC = 6; // It's not acurrete when it's use additionals bytes
  const MAX_STEPS_RECURSIVE = 10000;

  const debug = {
    allData: [],
    save(obj) {
      // return;
      this.allData.push(obj);
    },
    print() {
      for (const data of this.allData) {
        let text = "";
        for (const key in data) {
          text += `- ${key} : ${data[key]}`;
        }
        console.log(text);
      }
    },
    reset() {
      this.allData = [];
    },
    _defineMeta(idx) {
      idx = idx | this.metaIdx;
      if (undefined == this.meta[idx])
        this.meta[idx] = {
          all: [],
          group: [],
        };
      return idx;
    },
    metaIdx: 0,
    meta: [],
    setOther(obj, idx) {
      idx = this._defineMeta(idx);

      for (const key in obj) {
        if (undefined == this.meta[idx][key]) this.meta[idx][key] = [];
        this.meta[idx][key].push(obj[key]);
      }
    },
    setMeta(data, idx) {
      idx = this._defineMeta(idx);

      for (let v of data) {
        this.meta[idx].all[v] = (this.meta[idx].all[v] | 0) + 1;
        this.meta[idx].group[Math.floor(v)] =
          (this.meta[idx].group[Math.floor(v)] | 0) + 1;
      }
    },
    getObjectMetaGroup(meta) {
      return meta.group.reduce((c, e, i) => ({ ...c, [i]: e }), {});
    },
  };

  const BTCTx = {
    timeIniTx: null,
    timeEndTx: null,
    async getTxGroup() {
      const LATEST_GAMES =
        "https://blockchain.info/unconfirmed-transactions?format=json";
      this.timeIniTx = Math.floor(Date.now() / 1000);
      const headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "HEAD, POST, OPTIONS",
        "Access-Control-Max-Age": "1000",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        Vary: "Origin",
      };
      const rawData = await fetch(LATEST_GAMES, {});
      const txGroup = await rawData.json();
      this.timeEndTx = Math.floor(Date.now() / 1000);
      // console.log(txGroup);
      return txGroup;
    },
    _orderByFeeRate: (a, b) =>
      a.feeRate - b.feeRate || a.time - b.time || b.weight - a.weight,
    async getTx() {
      // await Utils.delay(3000);
      // return (function* () {
      //   yield {
      //     hash: "236186101ee1ff85302c6ad536a5b2186014a2faba6128fa7a95c17c0976c112",
      //     feeRate: 49.531669865642996,
      //     weight: 1042,
      //     fee: 12903,
      //     time: 1731549299,
      //     date: "2024-11-14T01:54:59.000Z",
      //   };
      // })().next().value;
      let txGroup = await this.getTxGroup();

      // Calc feeRate and sort all tx's
      const txGroupSorted = txGroup.txs
        .map((e) => ({
          ...["hash", "feeRate", "weight", "fee", "time"].reduce(
            (e1, v) => ({ ...e1, [v]: e[v] }),
            {}
          ),
          feeRate: e.fee / (e.weight / 4),
          date: new Date(1000 * e.time),
        }))
        .toSorted(this._orderByFeeRate);
      // console.table(txGroupSorted, [
      //   "hash",
      //   "link",
      //   "feeRate",
      //   "weight",
      //   "fee",
      //   "time",
      //   "date",
      // ]);
      return txGroupSorted.pop();
    },
  };

  const generateNumberFromTX = async (tx, numbersPlayers) => {
    debug.save({ generateNumberFromTX: tx });
    const validLengtToCut = (tx) => {
      return tx.length >= lengthToCut;
    };

    const bytesNumberPlayers = Utils.byteLength(numbersPlayers);
    const lengthToCut = bytesNumberPlayers * 2;
    const maxNumber = Number("0b" + "1".repeat(bytesNumberPlayers * 8));
    const rangeUnitWinner = Math.floor(maxNumber / numbersPlayers);

    if (!validLengtToCut(tx)) throw new Error("Overflow number random");
    if (tx.bytesNumberPlayers > MAX_BYTES_TO_CALC)
      throw new Error("Overflow bytes to calc."); // TODO: make a concat whit others tx o whatever

    const getHexPivot = async (tx, flag2Step = 1) => {
      debug.save({ fun: "getHexPivot", tx, flag2Step });
      if (flag2Step > 20)
        debug.setOther(
          { [`${numbersPlayers}`]: { tx, flag2Step } },
          numbersPlayers
        );
      if (MAX_STEPS_RECURSIVE <= flag2Step)
        throw new Error("Exceded number executions in fun: (getHexPivot)");

      const hexPivot = tx.slice(-lengthToCut);
      debug.save({ fun: "hexPivot", tx, flag2Step });
      if (!validLengtToCut(hexPivot)) hexPivot = getHexPivot(txToSha256.get());

      return hexPivot;
    };

    // To create TX for new use
    const txToSha256 = (() => {
      return {
        _tx: tx,
        async get() {
          this._tx = await Utils.sha256(this._tx);
          return this._tx;
        },
      };
    })();

    const getNumberWinner = async (newTx, flag1Step = 1) => {
      debug.save({ fun: "getNumberWinner", newTx, flag1Step });
      if (flag1Step > 2)
        debug.setOther(
          { [`${numbersPlayers}`]: { tx, flag1Step } },
          numbersPlayers
        );
      if (MAX_STEPS_RECURSIVE <= flag1Step)
        throw new Error("Exceded number executions in fun: (getNumberWinner)");

      const numberPivot = Number("0x" + (await getHexPivot(newTx)));
      const numberWinner = numberPivot / rangeUnitWinner;

      debug.save({ numberWinner });
      debug.setMeta([numberWinner], numbersPlayers);
      if (numberWinner < numbersPlayers) return Math.floor(numberWinner);

      newTx = newTx.slice(0, -1);
      return await getNumberWinner(newTx, ++flag1Step);
    };

    const numberWinner = await getNumberWinner(tx);

    console.log(tx);
    console.log(numberWinner);

    return numberWinner;
  };

  // TEST INI ---[
  // const txtTest =
  //   "ffad8fbb0416a76232c29d6fcba62d3dfd1d9048a976b369adffeedcebf9fedd";
  // generateNumberFromTX(txtTest, 128).then((winner) => {
  //   console.log(winner);
  // });

  // test multi tx
  // async function evalGenerateNumberFromTX() {
  //   const range = arrayRange(2, 130, 1);
  //   for await (const n of range) {
  //     debug.metaIdx = n;
  //     for await (const h of txs) {
  //       await generateNumberFromTX(h, n);
  //       // debug.print()
  //       // debug.reset()
  //     }
  //   }
  // }

  // const arrayRange = (start, stop, step) =>
  //   Array.from(
  //     { length: (stop - start) / step + 1 },
  //     (value, index) => start + index * step
  //   );

  // TEST END ]---

  function WordShuffler(holder, opt) {
    var that = this;
    var time = 0;
    this.now;
    this.then = Date.now();

    this.delta;
    this.currentTimeOffset = 0;

    this.word = null;
    this.currentWord = null;
    this.currentCharacter = 0;
    this.currentWordLength = 0;

    var options = {
      fps: 20,
      timeOffset: 5,
      textColor: "#000",
      fontSize: "50px",
      useCanvas: false,
      mixCapital: false,
      mixSpecialCharacters: false,
      needUpdate: true,
      colors: [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
        "#8bc34a",
        "#cddc39",
        "#ffeb3b",
        "#ffc107",
        "#ff9800",
        "#ff5722",
        "#795548",
        "#9e9e9e",
        "#607d8b",
      ],
    };

    if (typeof opt != "undefined") {
      for (const key in opt) {
        options[key] = opt[key];
      }
    }

    this.needUpdate = true;
    this.fps = options.fps;
    this.interval = 1000 / this.fps;
    this.timeOffset = options.timeOffset;
    this.textColor = options.textColor;
    this.fontSize = options.fontSize;
    this.mixCapital = options.mixCapital;
    this.mixSpecialCharacters = options.mixSpecialCharacters;
    this.colors = options.colors;

    this.useCanvas = options.useCanvas;

    this.chars = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];
    this.specialCharacters = [
      "!",
      "§",
      "$",
      "%",
      "&",
      "/",
      "(",
      ")",
      "=",
      "?",
      "_",
      "<",
      ">",
      "^",
      "°",
      "*",
      "#",
      "-",
      ":",
      ";",
      "~",
    ];

    if (this.mixSpecialCharacters) {
      this.chars = this.chars.concat(this.specialCharacters);
    }

    this.getRandomColor = function () {
      var randNum = Math.floor(Math.random() * this.colors.length);
      return this.colors[randNum];
    };

    //if Canvas

    this.position = {
      x: 0,
      y: 50,
    };

    //if DOM
    if (typeof holder != "undefined") {
      this.holder = holder;
    }

    if (!this.useCanvas && typeof this.holder == "undefined") {
      console.warn(
        "Holder must be defined in DOM Mode. Use Canvas or define Holder"
      );
    }

    this.getRandCharacter = function (characterToReplace) {
      if (characterToReplace == " ") {
        return " ";
      }
      var randNum = Math.floor(Math.random() * this.chars.length);
      var lowChoice = -0.5 + Math.random();
      var picketCharacter = this.chars[randNum];
      var choosen = picketCharacter.toLowerCase();
      if (this.mixCapital) {
        choosen =
          lowChoice < 0 ? picketCharacter.toLowerCase() : picketCharacter;
      }
      return choosen;
    };

    this.writeWord = function (word) {
      this.word = word;
      this.currentWord = word.split("");
      this.currentWordLength = this.currentWord.length;
    };

    this.generateSingleCharacter = function (color, character) {
      var span = document.createElement("span");
      span.style.color = color;
      span.innerHTML = character;
      return span;
    };

    this.updateCharacter = function (time) {
      this.now = Date.now();
      this.delta = this.now - this.then;

      if (this.delta > this.interval) {
        this.currentTimeOffset++;

        var word = [];

        if (
          this.currentTimeOffset === this.timeOffset &&
          this.currentCharacter !== this.currentWordLength
        ) {
          this.currentCharacter++;
          this.currentTimeOffset = 0;
        }
        for (var k = 0; k < this.currentCharacter; k++) {
          word.push(this.currentWord[k]);
        }

        for (
          var i = 0;
          i < this.currentWordLength - this.currentCharacter;
          i++
        ) {
          word.push(
            this.getRandCharacter(this.currentWord[this.currentCharacter + i])
          );
        }

        if (that.useCanvas) {
          c.clearRect(0, 0, stage.x * stage.dpr, stage.y * stage.dpr);
          c.font = that.fontSize + " sans-serif";
          var spacing = 0;
          word.forEach(function (w, index) {
            if (index > that.currentCharacter) {
              c.fillStyle = that.getRandomColor();
            } else {
              c.fillStyle = that.textColor;
            }
            c.fillText(w, that.position.x + spacing, that.position.y);
            spacing += c.measureText(w).width;
          });
        } else {
          if (that.currentCharacter === that.currentWordLength) {
            that.needUpdate = false;
          }
          this.holder.innerHTML = "";
          word.forEach(function (w, index) {
            var color = null;
            if (index > that.currentCharacter) {
              color = that.getRandomColor();
            } else {
              color = that.textColor;
            }
            that.holder.appendChild(that.generateSingleCharacter(color, w));
          });
        }
        this.then = this.now - (this.delta % this.interval);
      }
    };

    this.restart = function () {
      this.currentCharacter = 0;
      this.needUpdate = true;
    };

    function update(time) {
      time++;
      if (that.needUpdate) {
        that.updateCharacter(time);
      }
      requestAnimationFrame(update);
    }

    this.writeWord(this.holder.innerHTML);

    console.log(this.currentWord);
    update(time);
  }

  /* INI - Copy link */

  function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log("Copying text command was " + msg);
    } catch (err) {
      console.log("Oops, unable to copy");
    }
    document.body.removeChild(textArea);
  }

  return {
    init() {
      window.onload = function () {
        initRoulette();
        LayoutModule.init({
          eventPlay: sortear,
          gMdl: {
            initRoulette,
            generateNumberFromTX,
          },
        });
        new WordShuffler(document.getElementById("txtTitle_btc"), {
          textColor: "#000",
          timeOffset: 3,
        });

        const btnCopy = document.getElementById("btnCopy");

        btnCopy.addEventListener("click", async (event) => {
          const link = document.getElementById("aHash").href;
          copyTextToClipboard(link);
          if (!btnCopy.classList.contains("animate")) {
            btnCopy.classList.add("animate");
            setTimeout(() => {
              btnCopy.classList.remove("animate");
            }, ANIMATE_TIMEOUT);
          }
        });
      };
    },
  };
})();

export default GeneralModule;

import Utils from "/js/utils";
import { Globals } from "./globals.js";
import audioWin from "/assets/win.wav";

const LayoutModule = {
  init({ eventPlay, gMdl }) {
    this.eventPlay = eventPlay;
    this.replay = 1;
    this.gMdl = gMdl;

    this.taParticipants = document.getElementById("taParticipants");
    this.spResult = document.getElementById("result");
    this.inpHashOld = document.getElementById("inpHashOld");
    this.spValidationResult = document.getElementById("validationResult");
    this.spOldNumberResult = document.getElementById("spOldNumberResult");
    this.lblHashBtcOld = document.querySelector("[for=lblHashBtcOld]");
    this.canvas = document.getElementById("idcanvas");
    this.btnPlay = document.getElementById("btnPlay");
    this.btnClean = document.getElementById("btnClean");
    this.btnFillTest = document.getElementById("btnFillTest");
    this.inpHash = document.getElementById("inpHash");
    this.secBtnCopy = document.getElementById("secBtnCopy");
    this.txtQtyParticipants = document.getElementById("txtQtyParticipants");

    this.btnFillTest.addEventListener("click", () => this.fillTest());
    this.btnPlay.addEventListener("click", () => this.play());
    this.btnClean.addEventListener("click", () => this.cleanParticipants());
    this.inpHashOld.addEventListener("input", async (e) => {
      await this.calcOldWinner(e);
    });
    this.taParticipants.addEventListener("input", (e) =>
      this.handleTaParticipants(e)
    );
  },
  fillTest() {
    let text = "";
    for (const participant of Globals.array_concursantes_test) {
      text += participant + "\n";
    }
    Globals.array_concursantes = Globals.array_concursantes_test;
    this.txtQtyParticipants.innerHTML = `(${Globals.array_concursantes.length})`;
    this.gMdl.initRoulette();
    text = text.trim();
    this.taParticipants.value = text;
  },
  cleanParticipants() {
    this.taParticipants.value = "";
    Globals.array_concursantes = [];
    this.txtQtyParticipants.innerHTML = `(${Globals.array_concursantes.length})`;
    this.gMdl.initRoulette();
  },
  resetCanvasAngle() {
    this.canvas.style.transform = "";
    Globals.angle = Globals.angleInit;
    Globals.angleWaiting = 0;
  },
  async play() {
    if (Globals.array_concursantes.length > 130) {
      alert("El maximo puede sortear a 130 participantes");
      return;
    }
    if (Globals.array_concursantes.length < 2) {
      alert("El minimo a sortear es de 2");
      return;
    }

    this.resetCanvasAngle();
    this.secBtnCopy.classList.add("d-none");
    this.btnPlay.disabled = true;
    this.btnClean.disabled = true;
    this.btnFillTest.disabled = true;

    this.spResult.innerHTML = "";
    this.inpHash.value = "";
    this.spValidationResult.innerHTML = "";

    let dataPlayed = await this.eventPlay();
    console.log(dataPlayed);
  },
  onPlayed(dataPlayed) {
    this.spResult.innerHTML =
      `<h4 class="alert—check text-decoration-underline">${
        dataPlayed.winner
      } <small class="">#${dataPlayed.numberWinner + 1}</small></h4>` +
      `<smal class="fw-medium fst-italic">${Utils.getDateFormatted(
        dataPlayed.timeIniTx
      )}</smal>`;

    this.inpHash.value = `${dataPlayed.txHash}_${Globals.array_concursantes.length}`;
    this.spValidationResult.innerHTML =
      this._bindLinksHash(
        dataPlayed.txHash,
        Globals.array_concursantes.length
      ) +
      `<p ><smal class=" fst-italic">${Utils.getDateFormatted(
        dataPlayed.txTime
      )}</smal></p>`;
    this.secBtnCopy.classList.remove("d-none");

    this.btnPlay.disabled = false;
    this.btnClean.disabled = false;
    this.btnFillTest.disabled = false;

    var audio = new Audio(audioWin);
    audio.play();
  },
  _bindLinksHash(tx, cantParticipants) {
    const compressText = (t) => t.slice(0, 5) + "..." + t.slice(-5);
    const hash = tx + cantParticipants;
    return (
      `<smal class="fst-italic">
      <a href="${
        window.location.href
      }?hash=${hash}" id="aHash" target="_blank" rel="noopener noreferrer">hash: ${compressText(
        hash
      )}</a> | ` +
      `<a href="https://www.blockchain.com/explorer/transactions/btc/${tx}" target="_blank" rel="noopener noreferrer">tx: ${compressText(
        tx
      )}</a></small>`
    );
  },
  async calcOldWinner(e) {
    const val = e.currentTarget.value;
    if (val === "") {
      this.lblHashBtcOld.classList.add("d-none");
      return;
    }

    let [hash, qtyParticipants] = val.split("_");
    const invalidHash = (obj) => {
      obj.spOldNumberResult.innerHTML = "???";
      obj.spOldNumberResult.classList.add("text-danger");
      obj.lblHashBtcOld.classList.remove("d-none");
    };

    if (!Utils.isValidSha256(hash)) {
      invalidHash(this);
      return;
    }

    qtyParticipants = Number(qtyParticipants);
    if (qtyParticipants < 0) {
      invalidHash(this);
      return;
    }

    // Main
    const numberWinner = await this.gMdl.generateNumberFromTX(
      hash,
      qtyParticipants
    );

    this.spOldNumberResult.classList.remove("text-danger");
    this.spOldNumberResult.innerHTML = numberWinner + 1;
    this.lblHashBtcOld.classList.remove("d-none");
  },
  handleTaParticipants(e) {
    const val = e.currentTarget.value;
    const lines = val.split("\n"),
      newLines = [];

    if (lines.length > 130) {
      alert("El maximo puede sortear a 130 participantes");
      return;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length > 64) {
        alert("El nombre del participante es muy largo (max:64)");
        e.preventDefault();
      }
      if (line === "") continue;

      newLines.push(line);
    }

    Globals.array_concursantes = newLines;
    this.txtQtyParticipants.innerHTML = `(${Globals.array_concursantes.length})`;
    this.gMdl.initRoulette();
  },
};

export default LayoutModule;

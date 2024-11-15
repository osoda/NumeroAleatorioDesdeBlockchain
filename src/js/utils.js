const Utils = {
  //https://gist.github.com/zapthedingbat/38ebfbedd98396624e5b5f2ff462611d
  bitLength(number) {
    return Math.floor(Math.log2(number)) + 1;
  },
  byteLength(number) {
    return Math.ceil(this.bitLength(number) / 8);
  },
  async sha256(string) {
    const utf8 = new TextEncoder().encode(string);
    return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    });
  },
  isValidSha256(hash) {
    return /[A-Fa-f0-9]{64}/.exec(hash) && hash.length == 64;
  },
  getDateFormatted(unixTime) {
    let date = new Date(unixTime * 1000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toJSON().replace("T", " ").slice(0, -5);
  },
  delay: (time) => {
    return new Promise((res) => {
      setTimeout(res, time);
    });
  },
};

export default Utils;

export const flipArrayEndianness = (array: Uint8Array) => {
  const blen = array.byteLength;
  const u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
  const bpe = array.BYTES_PER_ELEMENT;
  let tmp;
  for (let i = 0; i < blen; i += bpe) {
    for (let j = i + bpe - 1, k = i; j > k; j--, k++) {
      tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;
    }
  }
  return array;
};

export const toBigInt = (array: Uint8Array) => {
  return new DataView(array.buffer).getBigInt64(0);
};

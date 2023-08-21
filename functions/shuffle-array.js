/**
 * 配列をシャッフルして返す。
 * @param {Array} BaseArray 元の配列
 * @returns {Array} シャッフル後の配列
 */
module.exports = (BaseArray) => {
  const ArrayCopy = BaseArray.concat();
  const ArrayLength = BaseArray.length;
  for (let i = ArrayLength - 1; i >= 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    // 要素入れ替え:
    [ArrayCopy[i], ArrayCopy[randomIndex]] = [ArrayCopy[randomIndex], ArrayCopy[i]];
  }

  return ArrayCopy;
};

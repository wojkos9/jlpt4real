import cangjie from "./assets/cangjie.json";
import _ from "lodash";

const radicals = "日月金木水火土竹戈十大中一弓人心手口尸廿山女田難卜重";

export function cangjieToRadicals(latin: string): string {
  const base = "A".charCodeAt(0);
  return _.range(0, latin.length)
    .map((i) => {
      const c = latin.charCodeAt(i) - base;
      if (0 <= c && c < radicals.length) {
        return radicals.charAt(c);
      } else {
        return latin.charAt(i);
      }
    })
    .join("");
}

export default cangjie as { [k: string]: string };

import { MOBILE_SIZE } from "./constants";

/**
 * @description use in styled css
 * @param {import("styled-components").ThemedCssFunction} css
 */
export function mobileCss(css) {
  return `@media (max-width: ${MOBILE_SIZE}px) {
    ${css}
  }`;
}

import { wordImage, wordImagePaths } from "../../lib/og/endpoints";

export const getStaticPaths = wordImagePaths("en");
export const GET = wordImage;

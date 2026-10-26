import { wordImage, wordImagePaths } from "../../../lib/og/endpoints";

export const getStaticPaths = wordImagePaths("ja");
export const GET = wordImage;

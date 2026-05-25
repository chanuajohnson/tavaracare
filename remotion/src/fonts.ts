import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/WorkSans";

export const { fontFamily: serifFamily } = loadSerif("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const { fontFamily: sansFamily } = loadSans("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
});

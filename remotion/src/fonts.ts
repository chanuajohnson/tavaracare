import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Karla";

export const { fontFamily: serifFamily } = loadSerif("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});
loadSerif("italic", { weights: ["400"], subsets: ["latin"] });

export const { fontFamily: sansFamily } = loadSans("normal", {
  weights: ["300", "400", "500"],
  subsets: ["latin"],
});

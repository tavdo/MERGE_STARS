// Presentation review only. Never deletes assets or changes CORE records.
export const withheldPhotographs: Readonly<Record<string, string>> = {
  '/museum-v78/assets/founder-living-luxury-system-20261019.png': 'Conflicting composite composition, unsupported LIVE/PASS badges and illustrative prices. The approved logo crop remains unchanged.',
  '/museum-v78/assets/material-passport.png': 'Illustrative certificate identifiers and QC PASSED labels are not backed by batch evidence.',
};

export function displayablePhotograph(image: string): boolean {
  return !Object.hasOwn(withheldPhotographs, image);
}

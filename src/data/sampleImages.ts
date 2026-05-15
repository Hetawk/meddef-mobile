import type { DatasetKey } from "./datasets";

/** Static paths under Next.js `public/` — same as `next-meddef` inference page. */
export const SAMPLE_IMAGES: Record<
  DatasetKey,
  { path: string; label: string }[]
> = {
  tbcr: [
    { path: "/datasets/samples/tbcr/Normal-2253.png", label: "Normal" },
    { path: "/datasets/samples/tbcr/Normal-961.png", label: "Normal" },
    {
      path: "/datasets/samples/tbcr/Tuberculosis-351.png",
      label: "Tuberculosis",
    },
    {
      path: "/datasets/samples/tbcr/Tuberculosis-263.png",
      label: "Tuberculosis",
    },
  ],
  chest_xray: [
    {
      path: "/datasets/samples/chest_xray/NORMAL-IM-0001.jpeg",
      label: "Normal",
    },
    {
      path: "/datasets/samples/chest_xray/NORMAL-IM-0003.jpeg",
      label: "Normal",
    },
    {
      path: "/datasets/samples/chest_xray/PNEUMONIA-person82_virus_155.jpeg",
      label: "Pneumonia",
    },
    {
      path: "/datasets/samples/chest_xray/PNEUMONIA-person71_virus_131.jpeg",
      label: "Pneumonia",
    },
  ],
  roct: [
    { path: "/datasets/samples/roct/CNV-1016042-1.jpeg", label: "CNV" },
    { path: "/datasets/samples/roct/DME-2105194-1.jpeg", label: "DME" },
    { path: "/datasets/samples/roct/DRUSEN-1083159-1.jpeg", label: "Drusen" },
    { path: "/datasets/samples/roct/NORMAL-443980-1.jpeg", label: "Normal" },
  ],
};

export const SCORE_POINTS = {
  NORMAL_PROOF: 10,
  IMAGE_PROOF: 15,
};

/**
 * Centralized calculation of points for a single proof submission
 */
export function calculateProofPoints(hasImage: boolean): number {
  return hasImage ? SCORE_POINTS.IMAGE_PROOF : SCORE_POINTS.NORMAL_PROOF;
}

/**
 * Calculates the total Flex Score based on historical proofs points list
 */
export function calculateFlexScore(proofPointsList: number[]): number {
  return proofPointsList.reduce((sum, points) => sum + points, 0);
}

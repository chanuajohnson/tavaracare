import { CostEstimator } from "./CostEstimator";

interface Props {
  postSlug: string;
}

/**
 * Slug-specific hero CTA for the senior-care-costs post.
 * Now renders the interactive CostEstimator so visitors get an immediate
 * price answer instead of being routed straight into the readiness quiz.
 */
export function CostHeroCTA({ postSlug }: Props) {
  return <CostEstimator postSlug={postSlug} />;
}

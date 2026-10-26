/*
 * Which reviews count in a restaurant's public rating: those written by an existing, active account,
 * plus the labelled demo reviews of a demo restaurant. Seeded or orphaned rows never lift a real
 * restaurant's stars. `review` and `restaurant` are the SQL aliases in the calling query.
 */
export const countedReview = (review: string, restaurant: string) =>
  `(EXISTS (SELECT 1 FROM accounts ra WHERE ra.id=${review}.user_id AND ra.status='active') OR (${review}.id LIKE 'rf-demo-review-%' AND ${restaurant}.is_demo=1))`;

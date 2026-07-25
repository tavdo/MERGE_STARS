import MemberPublicPage from './MemberPublicPage'

/** Brand profile URL `/b/:brandLineId` — same full profile as `/u/:mergeId` */
export default function BrandPublicPage() {
  return <MemberPublicPage mode="brand" />
}

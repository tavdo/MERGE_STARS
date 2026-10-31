import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/shared/types/api.types";
import type { DesignProposal } from "@/experience/core.api";
export default function DesignReviewPage() {
  const { i18n } = useTranslation(),
    ka = i18n.language.startsWith("ka");
  const query = useQuery({
    queryKey: ["design-review-queue"],
    queryFn: () =>
      api
        .get<ApiResponse<DesignProposal[]>>("/experience/review-queue")
        .then((r) => r.data.data),
    retry: false,
  });
  return (
    <AdminLayout
      title={ka ? "დიზაინის შეფასების მოთხოვნები" : "Design review requests"}
    >
      <p>
        {ka
          ? "მონახაზები მოითხოვს უფლებების, გეომეტრიის, მასალისა და საწარმოო შესაძლებლობის შეფასებას. ამ გვერდიდან გადახდის ან წარმოების დამტკიცება არ ხდება."
          : "Proposals require rights, geometry, material and feasibility review. This page cannot authorize payment or production."}
      </p>
      {query.isLoading && <p role="status">Loading…</p>}
      {query.isError && (
        <p role="alert">
          {ka ? "მოთხოვნები ვერ ჩაიტვირთა." : "Requests unavailable."}
        </p>
      )}
      {query.data?.length === 0 && (
        <p>
          {ka ? "შეფასების მოთხოვნა ჯერ არ არის." : "No review requests yet."}
        </p>
      )}
      {query.data?.map((d) => (
        <article
          className="gold-card"
          key={d.id}
          style={{ padding: 24, marginTop: 20 }}
        >
          <h2>CONCEPT / REQUESTED</h2>
          <p>Draft: {d.versionId}</p>
          <p>Source: {d.sourceProductId}</p>
          <p>Source version: {d.sourceVersion}</p>
          <p>
            House: {d.houseId || "—"} · Brand Line: {d.brandLineId || "—"}
          </p>
          <p>
            {d.preferences.material} · {d.preferences.initials}
          </p>
          <p>{d.preferences.notes}</p>
          <p>
            {ka
              ? "დამტკიცებული შეთავაზება არ არსებობს."
              : "No verified offer exists."}
          </p>
        </article>
      ))}
    </AdminLayout>
  );
}

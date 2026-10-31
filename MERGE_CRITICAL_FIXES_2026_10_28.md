# Critical review response: 28 October 2026

## Confirmed issues fixed in the local official frontend

1. MeshyAIPanel simulated progress without a provider, and accepted an empty
   provider response as completion. CatalogItemStudio supplied a null-result demo
   handler. Removed both paths. Without a real handler generation is disabled;
   a missing or unsafe model URL produces an error, not completion. A synchronous
   in-flight guard prevents duplicate clicks from dispatching duplicate requests.
2. Georgian, Russian and English homepage labels stated patented innovation
   without linking evidence. Replaced them with material-development and
   verification wording. Material composition, durability, application safety and
   patent status are explicitly subject to supporting evidence.
3. Multiple mounted Meshy panels shared a fixed prompt element ID. Each now uses
   a unique React ID so its label targets its own prompt.

## Checks

PASS: frontend/scripts/meshy-truth-boundary.test.mjs.
PASS: TypeScript project build and Vite production build.
NOT RUN: browser/mobile and real Meshy model-loading E2E.
Deployment: local source only; neither mergestars.com nor the separate private
Museum Site was updated by this change. Public production deployment requires
the existing founder approval process.

## Unresolved evidence, not code promises

- Patent or application: official number, jurisdiction, owner and current status.
- Material: approved recipe, measured composition, validated process, safety and
  durability tests; distinguish polymer composite from a conventional metal alloy.
- Production: manufacturer agreement, capability, sample, QC and delivery terms.
- Economics: verified material mass, waste, processing, component, QC, packaging,
  logistics and tax inputs. Do not invent margins or payable product prices.
- Passport: a QR link locates a record; it alone is not proof of physical-item
  authenticity. Issuer, evidence, version history and verification remain separate.
- Corporate email: no unprovisioned address was invented or substituted.

The supplied critique is an allegation source, not proof that patents, partners,
production or commercial value do not exist. Its broad technical and investment
conclusions were not adopted as verified facts. No financial or legal opinion is
provided by these fixes.

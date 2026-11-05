export const modules = [
  ["Understanding Merchant Services", "Merchant Foundations"],
  ["How a Card Transaction Works", "Merchant Foundations"],
  ["Interchange and Processing Fees", "Merchant Foundations"],
  ["Pricing Models and Disclosures", "Merchant Foundations"],
  ["Reading a Merchant Statement", "Merchant Foundations"],
  ["Approaching Business Owners", "Sales Essentials"],
  ["The PMG Sales Pitch", "Sales Essentials"],
  ["Discovering Merchant Needs", "Sales Essentials"],
  ["Comparing Statements and Proposals", "Sales Essentials"],
  ["Handling Objections", "Sales Essentials"],
  ["Closing and Submitting an Application", "Sales Essentials"],
  ["POS Systems Versus Terminals", "Products & Solutions"],
  ["Clover Restaurant Solutions", "Products & Solutions"],
  ["Dejavoo Terminal Basics", "Products & Solutions"],
  ["Matching Equipment to Merchants", "Products & Solutions"],
  ["Merchant Onboarding and Activation", "Operations"],
  ["Batches, Deposits and Reconciliation", "Operations"],
  ["Declines and Terminal Troubleshooting", "Operations"],
  ["Refunds, Voids and Disputes", "Operations"],
  ["Merchant Service and Retention", "Operations"],
  ["PCI Data Security Basics", "Compliance & Ethics"],
  ["Card Rules and Ethical Selling", "Compliance & Ethics"],
  ["Final PMG Skills Assessment", "Compliance & Ethics"],
] as const;

export function padModule(index: number) {
  return String(index + 1).padStart(2, "0");
}

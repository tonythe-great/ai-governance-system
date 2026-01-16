import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create dropdown options
  const dropdownOptions = [
    // Use Case Options
    { category: "useCase", value: "content_generation", label: "Content Generation", sortOrder: 1 },
    { category: "useCase", value: "data_analysis", label: "Data Analysis", sortOrder: 2 },
    { category: "useCase", value: "customer_service", label: "Customer Service", sortOrder: 3 },
    { category: "useCase", value: "code_assistance", label: "Code Assistance", sortOrder: 4 },
    { category: "useCase", value: "research", label: "Research & Summarization", sortOrder: 5 },
    { category: "useCase", value: "automation", label: "Process Automation", sortOrder: 6 },
    { category: "useCase", value: "other", label: "Other", sortOrder: 7 },

    // Vendor Options
    { category: "vendor", value: "openai", label: "OpenAI (ChatGPT, GPT-4)", sortOrder: 1 },
    { category: "vendor", value: "anthropic", label: "Anthropic (Claude)", sortOrder: 2 },
    { category: "vendor", value: "microsoft", label: "Microsoft (Copilot, Azure AI)", sortOrder: 3 },
    { category: "vendor", value: "google", label: "Google (Gemini, Vertex AI)", sortOrder: 4 },
    { category: "vendor", value: "meta", label: "Meta (Llama)", sortOrder: 5 },
    { category: "vendor", value: "amazon", label: "Amazon (Bedrock)", sortOrder: 6 },
    { category: "vendor", value: "other", label: "Other", sortOrder: 7 },

    // Stage Options
    { category: "currentStage", value: "evaluation", label: "Evaluation / Pilot", sortOrder: 1 },
    { category: "currentStage", value: "development", label: "Development", sortOrder: 2 },
    { category: "currentStage", value: "testing", label: "Testing / QA", sortOrder: 3 },
    { category: "currentStage", value: "production", label: "Production", sortOrder: 4 },
    { category: "currentStage", value: "deprecated", label: "Deprecated / Retiring", sortOrder: 5 },

    // User Count Options
    { category: "numberOfUsers", value: "1-10", label: "1-10 users", sortOrder: 1 },
    { category: "numberOfUsers", value: "11-50", label: "11-50 users", sortOrder: 2 },
    { category: "numberOfUsers", value: "51-200", label: "51-200 users", sortOrder: 3 },
    { category: "numberOfUsers", value: "201-1000", label: "201-1000 users", sortOrder: 4 },
    { category: "numberOfUsers", value: "1000+", label: "1000+ users", sortOrder: 5 },

    // Output Usage Options
    { category: "outputUsage", value: "direct_action", label: "Direct action (AI output used as-is)", sortOrder: 1 },
    { category: "outputUsage", value: "human_review_required", label: "Human review required before action", sortOrder: 2 },
    { category: "outputUsage", value: "advisory_only", label: "Advisory only (suggestions for humans)", sortOrder: 3 },
    { category: "outputUsage", value: "automated_with_oversight", label: "Automated with human oversight", sortOrder: 4 },

    // Human Review Level Options
    { category: "humanReviewLevel", value: "none", label: "No human review", sortOrder: 1 },
    { category: "humanReviewLevel", value: "spot_check", label: "Spot check (random sampling)", sortOrder: 2 },
    { category: "humanReviewLevel", value: "review_before_critical", label: "Review before critical decisions", sortOrder: 3 },
    { category: "humanReviewLevel", value: "always", label: "Always reviewed by human", sortOrder: 4 },

    // Data Type Options
    { category: "dataTypes", value: "public_information", label: "Public Information", sortOrder: 1 },
    { category: "dataTypes", value: "internal_documents", label: "Internal Documents", sortOrder: 2 },
    { category: "dataTypes", value: "business_strategy", label: "Business Strategy", sortOrder: 3 },
    { category: "dataTypes", value: "employee_data", label: "Employee Data", sortOrder: 4 },
    { category: "dataTypes", value: "customer_data", label: "Customer Data", sortOrder: 5 },
    { category: "dataTypes", value: "financial_data", label: "Financial Data", sortOrder: 6 },
    { category: "dataTypes", value: "pii", label: "Personal Information (PII)", sortOrder: 7 },
    { category: "dataTypes", value: "health_data", label: "Health Data", sortOrder: 8 },

    // Vendor Data Storage Options
    { category: "vendorDataStorage", value: "no_storage", label: "No - Data is not stored by vendor", sortOrder: 1 },
    { category: "vendorDataStorage", value: "temporary", label: "Temporary - Deleted after processing", sortOrder: 2 },
    { category: "vendorDataStorage", value: "persistent", label: "Yes - Data is stored persistently", sortOrder: 3 },
    { category: "vendorDataStorage", value: "unknown", label: "Unknown / Not sure", sortOrder: 4 },

    // Federal Contracts Options
    { category: "hasFederalContracts", value: "yes", label: "Yes", sortOrder: 1 },
    { category: "hasFederalContracts", value: "no", label: "No", sortOrder: 2 },
    { category: "hasFederalContracts", value: "unknown", label: "Unknown", sortOrder: 3 },
  ];

  for (const option of dropdownOptions) {
    await prisma.dropdownOption.upsert({
      where: {
        category_value: {
          category: option.category,
          value: option.value,
        },
      },
      update: {
        label: option.label,
        sortOrder: option.sortOrder,
      },
      create: option,
    });
  }

  // Create a demo user (optional - for testing)
  const hashedPassword = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

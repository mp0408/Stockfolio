import { NextResponse } from "next/server";

interface ProductInput {
  name: string;
  sku: string;
  quantity: number;
  low_stock_threshold: number;
}

export async function POST(request: Request) {
  try {
    const { products } = (await request.json()) as { products: ProductInput[] };

    if (!products || products.length === 0) {
      return NextResponse.json({
        summary: "No products available in inventory yet to analyze.",
        urgentActions: [],
        recommendations: [
          "Add your primary products to the inventory to start receiving automated stock recommendations.",
        ],
        riskLevel: "low",
        savingsTip: "Keep initial stock batches small to minimize upfront holding costs.",
        source: "inventory-engine",
      });
    }

    const outOfStock = products.filter((p) => p.quantity <= 0);
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold
    );
    const inStock = products.filter((p) => p.quantity > p.low_stock_threshold);

    // Calculate inventory risk level
    const riskLevel: "low" | "medium" | "high" =
      outOfStock.length > 2 || lowStock.length > 5
        ? "high"
        : outOfStock.length > 0 || lowStock.length > 2
        ? "medium"
        : "low";

    // Generate targeted urgent actions
    const urgentActions: string[] = [];
    if (outOfStock.length > 0) {
      const names = outOfStock.slice(0, 3).map((p) => p.name).join(", ");
      urgentActions.push(`Out of Stock Alert: Replenish ${names} immediately to prevent lost sales.`);
    }
    if (lowStock.length > 0) {
      const names = lowStock.slice(0, 3).map((p) => p.name).join(", ");
      urgentActions.push(`Low Stock Warning: Place reorders for ${names} before safety stock is depleted.`);
    }
    if (urgentActions.length === 0) {
      urgentActions.push("All items are currently above minimum safety thresholds. Inventory health is optimal.");
    }

    // Generate intelligent business recommendations
    const recommendations: string[] = [];

    // Category analysis (Shoes vs Bags)
    const shoesCount = products.filter((p) => p.sku.startsWith("SHO")).length;
    const bagsCount = products.filter((p) => p.sku.startsWith("BAG")).length;

    if (shoesCount > 0 && bagsCount > 0) {
      recommendations.push(
        `Cross-merchandising Opportunity: Create promotional bundles pairing top-selling footwear with matching travel bags or backpacks.`
      );
    }

    // High velocity reorder recommendations
    const fastDepleting = products
      .filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold * 1.5)
      .sort((a, b) => (a.quantity / a.low_stock_threshold) - (b.quantity / b.low_stock_threshold));

    if (fastDepleting.length > 0) {
      recommendations.push(
        `Reorder Buffer: Increase standard reorder quantity by 15-20% for ${fastDepleting[0].name} to maintain buffer during lead times.`
      );
    } else {
      recommendations.push(
        "Maintain current lead-time reorder intervals based on historical stock depletion rates."
      );
    }

    recommendations.push(
      "Conduct weekly spot-audits on high-value items (leather goods & performance sneakers) to maintain 99%+ inventory accuracy."
    );

    // Practical savings tip
    const savingsTips = [
      "Consolidate supplier purchase orders into bi-weekly batches to qualify for tiered volume discounts and lower freight costs.",
      "Set automated reorder trigger points to eliminate rush shipping surcharges from distributors.",
      "Review inventory turnover quarterly to identify deadstock early and free up warehouse shelf space.",
    ];
    const savingsTip = savingsTips[products.length % savingsTips.length];

    return NextResponse.json({
      summary: `Inventory overview: ${products.length} products tracked — ${inStock.length} healthy in-stock, ${lowStock.length} low stock, and ${outOfStock.length} depleted items.`,
      urgentActions,
      recommendations,
      riskLevel,
      savingsTip,
      source: "inventory-engine",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate inventory recommendations." },
      { status: 500 }
    );
  }
}

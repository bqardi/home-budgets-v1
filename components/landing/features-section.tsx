import { BarChart3, PieChart, TrendingUp, Shield } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Excel-Like Interface",
      description:
        "Familiar spreadsheet view for your monthly budget. Quickly see all your income and expenses in one place.",
    },
    {
      icon: PieChart,
      title: "Smart Categorization",
      description:
        "Organize your budget with custom categories. See exactly where your money goes each month.",
    },
    {
      icon: TrendingUp,
      title: "Recurring Patterns",
      description:
        "Set up monthly, quarterly, or yearly expenses. Automatically distribute amounts across months.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is encrypted and only accessible to you. No ads, no tracking, just your budget.",
    },
  ];

  return (
    <section className="py-24 border-t">
      <h2 className="text-3xl font-bold text-center mb-16">
        Powerful Features for Smart Budgeting
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

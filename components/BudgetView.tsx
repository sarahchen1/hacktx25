"use client";

import { useGates } from "@/lib/hooks/useGates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";

export function BudgetView() {
  const { gates } = useGates();
  const categoriesEnabled = gates.txn_category;

  const mockData = {
    totalSpent: 2847.5,
    monthlyBudget: 3000,
    categories: [
      { name: "Food & Dining", amount: 856.3, percentage: 30.1, trend: "up" },
      {
        name: "Transportation",
        amount: 423.8,
        percentage: 14.9,
        trend: "down",
      },
      { name: "Shopping", amount: 678.9, percentage: 23.8, trend: "up" },
      {
        name: "Entertainment",
        amount: 234.5,
        percentage: 8.2,
        trend: "stable",
      },
      { name: "Utilities", amount: 654.0, percentage: 23.0, trend: "stable" },
    ],
    insights: [
      "You spent 15% more on dining this month",
      "Transportation costs decreased by 8%",
      "You're on track to stay within budget",
    ],
  };

  const remainingBudget = mockData.monthlyBudget - mockData.totalSpent;
  const budgetPercentage = (mockData.totalSpent / mockData.monthlyBudget) * 100;

  if (!categoriesEnabled) {
    return (
      <Card className="p-8 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center">
            <PieChart className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Categories Disabled
            </h3>
            <p className="text-slate-400 mb-4">
              Transaction categorization is disabled by your consent settings.
            </p>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Privacy Mode Active
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Budget Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ${mockData.totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ${remainingBudget.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {budgetPercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-400">Budget Used</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                budgetPercentage > 90
                  ? "bg-red-500"
                  : budgetPercentage > 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">
            Spending by Category
          </h2>
        </div>

        <div className="space-y-3">
          {mockData.categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-white font-medium">{category.name}</span>
                <div className="flex items-center gap-1">
                  {category.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  )}
                  {category.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-green-400" />
                  )}
                  {category.trend === "stable" && (
                    <div className="w-4 h-4 rounded-full bg-slate-500" />
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  ${category.amount.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">{category.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Insights</h2>
        </div>

        <div className="space-y-2">
          {mockData.insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <p className="text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

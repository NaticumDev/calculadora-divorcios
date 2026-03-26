"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const BAR_COLOR = "#1a365d";
const PIE_COLORS = ["#1a365d", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];
const RECOMMEND_COLORS: Record<string, string> = {
  "Sí": "#22c55e",
  "No": "#ef4444",
  "Tal vez": "#f59e0b",
};

interface FeedbackChartsProps {
  easeDistribution: { rating: string; count: number }[];
  accuracyDistribution: { rating: string; count: number }[];
  sectionData: { name: string; value: number }[];
  recommendData: { name: string; value: number }[];
}

export default function FeedbackCharts({
  easeDistribution,
  accuracyDistribution,
  sectionData,
  recommendData,
}: FeedbackChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ease of use bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facilidad de uso</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={easeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number) => [`${value} respuestas`, "Cantidad"]}
                labelFormatter={(label) => `Calificación: ${label}`}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Accuracy bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Precisión de cálculos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accuracyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number) => [`${value} respuestas`, "Cantidad"]}
                labelFormatter={(label) => `Calificación: ${label}`}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most useful section pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sección más útil</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sectionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                }
              >
                {sectionData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} respuestas`, "Cantidad"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Would recommend pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">¿Recomendaría la herramienta?</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={recommendData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {recommendData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RECOMMEND_COLORS[entry.name] || "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} respuestas`, "Cantidad"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

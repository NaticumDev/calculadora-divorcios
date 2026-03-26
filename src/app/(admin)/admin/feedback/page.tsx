export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { MessageSquare, Star, Users, ThumbsUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import FeedbackCharts from "./FeedbackCharts";

export default async function AdminFeedbackPage() {
  const responses = await prisma.feedbackResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;

  if (total === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Retroalimentación
          </h1>
          <p className="mt-1 text-muted-foreground">
            Resultados de la encuesta de retroalimentación.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">
              Aún no hay respuestas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Comparte la encuesta con los abogados para recibir retroalimentación.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgEase = (
    responses.reduce((sum, r) => sum + r.easeOfUse, 0) / total
  ).toFixed(1);
  const avgAccuracy = (
    responses.reduce((sum, r) => sum + r.accuracyRating, 0) / total
  ).toFixed(1);
  const recommendYes = responses.filter(
    (r) => r.wouldRecommend === "Sí"
  ).length;
  const recommendPct = ((recommendYes / total) * 100).toFixed(0);

  // Distribution data for charts
  const easeDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}`,
    count: responses.filter((r) => r.easeOfUse === rating).length,
  }));

  const accuracyDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}`,
    count: responses.filter((r) => r.accuracyRating === rating).length,
  }));

  const sectionCounts: Record<string, number> = {};
  responses.forEach((r) => {
    sectionCounts[r.mostUsefulSection] =
      (sectionCounts[r.mostUsefulSection] || 0) + 1;
  });
  const sectionData = Object.entries(sectionCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const recommendCounts: Record<string, number> = {};
  responses.forEach((r) => {
    recommendCounts[r.wouldRecommend] =
      (recommendCounts[r.wouldRecommend] || 0) + 1;
  });
  const recommendData = Object.entries(recommendCounts).map(
    ([name, value]) => ({ name, value })
  );

  const comments = responses
    .filter((r) => r.additionalComments)
    .map((r) => ({
      name: r.respondentName || "Anónimo",
      comment: r.additionalComments!,
      date: r.createdAt.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Retroalimentación
        </h1>
        <p className="mt-1 text-muted-foreground">
          Resultados de la encuesta de retroalimentación ({total} respuestas).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">
                  Total respuestas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{avgEase}/5</p>
                <p className="text-xs text-muted-foreground">
                  Facilidad de uso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{avgAccuracy}/5</p>
                <p className="text-xs text-muted-foreground">
                  Precisión de cálculos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{recommendPct}%</p>
                <p className="text-xs text-muted-foreground">Recomendarían</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Client component */}
      <FeedbackCharts
        easeDistribution={easeDistribution}
        accuracyDistribution={accuracyDistribution}
        sectionData={sectionData}
        recommendData={recommendData}
      />

      {/* Comments table */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comentarios y sugerencias</CardTitle>
            <CardDescription>
              {comments.length} comentario{comments.length !== 1 ? "s" : ""} recibido{comments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

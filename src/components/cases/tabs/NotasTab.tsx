"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";

interface NotasTabProps {
  caseId: string;
  notes: any[];
  onRefresh: () => void;
}

export default function NotasTab({
  caseId,
  notes,
  onRefresh,
}: NotasTabProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent("");
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    setDeletingId(noteId);
    try {
      await fetch(`/api/cases/${caseId}/notes/${noteId}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch {
      // error silenciado
    } finally {
      setDeletingId(null);
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Agregar nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquarePlus className="h-5 w-5" />
            Nueva nota
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
            placeholder="Escribe una nota sobre el caso..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Ctrl+Enter para enviar
            </p>
            <Button
              onClick={handleSubmit}
              disabled={saving || !content.trim()}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquarePlus className="mr-2 h-4 w-4" />
              )}
              Agregar nota
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de notas */}
      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay notas registradas en este caso.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note: any) => (
            <Card key={note.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(note.createdAt).toLocaleDateString("es-MX", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="text-red-600 hover:text-red-700 shrink-0"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

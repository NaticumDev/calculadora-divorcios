"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  FolderOpen,
} from "lucide-react";

interface DocumentosTabProps {
  caseId: string;
  documents: any[];
}

const CATEGORIES = [
  {
    key: "acta_matrimonio",
    label: "Acta de matrimonio",
    icon: FileText,
  },
  {
    key: "acta_nacimiento",
    label: "Actas de nacimiento",
    icon: FileText,
  },
  {
    key: "identificacion",
    label: "Identificaciones",
    icon: FileText,
  },
  {
    key: "escritura",
    label: "Escrituras",
    icon: FileText,
  },
  {
    key: "acta_constitutiva",
    label: "Actas constitutivas",
    icon: FileText,
  },
  {
    key: "estado_cuenta",
    label: "Estados de cuenta",
    icon: FileText,
  },
  {
    key: "otro",
    label: "Otros",
    icon: FolderOpen,
  },
];

export default function DocumentosTab({
  caseId,
  documents,
}: DocumentosTabProps) {
  const groupedDocs = CATEGORIES.map((cat) => ({
    ...cat,
    items: documents.filter((d) => d.category === cat.key),
  }));

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Proximamente: Subir documentos
              </p>
              <p className="text-xs text-blue-700">
                La funcionalidad de carga de documentos estara disponible
                proximamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groupedDocs.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {cat.label}
                  </span>
                  <Badge variant="secondary">{cat.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cat.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Sin documentos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cat.items.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.name}
                          </p>
                          {doc.uploadedAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.uploadedAt).toLocaleDateString(
                                "es-MX"
                              )}
                            </p>
                          )}
                        </div>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline shrink-0 ml-2"
                          >
                            Ver
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

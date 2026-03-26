import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type {
  CalculationResult,
  YearlyProjection,
} from "@/types/calculation";

const PRIMARY = "#1a365d";
const LIGHT_BG = "#f0f4f8";
const BORDER = "#cbd5e0";
const TEXT_DARK = "#1a202c";
const TEXT_MUTED = "#4a5568";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: TEXT_DARK,
  },
  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  firmName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 2,
  },
  headerDetail: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  // Title
  titleBlock: {
    backgroundColor: PRIMARY,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  dateText: {
    fontSize: 9,
    color: "#cbd5e0",
    textAlign: "center",
    marginTop: 4,
  },
  // Client
  clientBlock: {
    backgroundColor: LIGHT_BG,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  clientLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  // Section
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: PRIMARY,
    padding: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  sectionBody: {
    paddingHorizontal: 4,
  },
  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  infoLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
    flex: 1,
  },
  infoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    textAlign: "right",
  },
  // Table
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    backgroundColor: LIGHT_BG,
  },
  tableCell: {
    fontSize: 8,
    color: TEXT_DARK,
  },
  // Summary
  summaryBox: {
    backgroundColor: LIGHT_BG,
    border: `1px solid ${PRIMARY}`,
    borderWidth: 1,
    borderColor: PRIMARY,
    padding: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  summaryLabel: {
    fontSize: 10,
    color: TEXT_DARK,
  },
  summaryValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: PRIMARY,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  summaryTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  disclaimer: {
    fontSize: 7,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  pageNumber: {
    fontSize: 8,
    color: TEXT_MUTED,
    textAlign: "center",
  },
  naText: {
    fontSize: 9,
    color: TEXT_MUTED,
    fontStyle: "italic",
    paddingVertical: 4,
  },
});

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface DivorceReportProps {
  result: CalculationResult;
  input: {
    divorceType: "VOLUNTARIO" | "CONTENCIOSO";
    marriageDurationYears: number;
    numberOfChildren: number;
    childrenAges: number[];
    obligorMonthlyIncome: number;
    beneficiaryMonthlyIncome: number;
  };
  branding: {
    firmName: string;
    lawyerName: string;
    phone: string;
    email: string;
    address: string;
    logoUrl?: string | null;
  };
  clientName?: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>
    </View>
  );
}

export default function DivorceReport({
  result,
  input,
  branding,
  clientName,
}: DivorceReportProps) {
  const now = new Date();

  return (
    <Document>
      {/* Page 1 */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.firmName}>
              {branding.firmName || "Despacho Jurídico"}
            </Text>
            {branding.lawyerName ? (
              <Text style={styles.headerDetail}>
                Lic. {branding.lawyerName}
              </Text>
            ) : null}
            {branding.phone ? (
              <Text style={styles.headerDetail}>Tel: {branding.phone}</Text>
            ) : null}
            {branding.email ? (
              <Text style={styles.headerDetail}>{branding.email}</Text>
            ) : null}
            {branding.address ? (
              <Text style={styles.headerDetail}>{branding.address}</Text>
            ) : null}
          </View>
          {branding.logoUrl ? (
            <Image src={branding.logoUrl} style={styles.logo} />
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            Reporte de Estimación de Costos de Divorcio
          </Text>
          <Text style={styles.dateText}>
            Fecha: {formatDate(now)}
          </Text>
        </View>

        {/* Client info */}
        {clientName ? (
          <View style={styles.clientBlock}>
            <Text style={styles.clientLabel}>CLIENTE</Text>
            <Text style={styles.clientName}>{clientName}</Text>
          </View>
        ) : null}

        {/* Section 1: Tipo de Divorcio */}
        <View style={styles.section}>
          <SectionHeader number={1} title="Tipo de Divorcio" />
          <View style={styles.sectionBody}>
            <InfoRow
              label="Modalidad"
              value={
                input.divorceType === "VOLUNTARIO"
                  ? "Divorcio Voluntario"
                  : "Divorcio Contencioso"
              }
            />
          </View>
        </View>

        {/* Section 2: Información Familiar */}
        <View style={styles.section}>
          <SectionHeader number={2} title="Información Familiar" />
          <View style={styles.sectionBody}>
            <InfoRow
              label="Duración del matrimonio"
              value={`${input.marriageDurationYears} ${input.marriageDurationYears === 1 ? "año" : "años"}`}
            />
            <InfoRow
              label="Número de hijos"
              value={String(input.numberOfChildren)}
            />
            {input.childrenAges.length > 0 ? (
              <InfoRow
                label="Edades de los hijos"
                value={input.childrenAges
                  .map((a) => `${a} ${a === 1 ? "año" : "años"}`)
                  .join(", ")}
              />
            ) : null}
            <InfoRow
              label="Ingreso mensual del obligado"
              value={formatMXN(input.obligorMonthlyIncome)}
            />
            <InfoRow
              label="Ingreso mensual del beneficiario"
              value={formatMXN(input.beneficiaryMonthlyIncome)}
            />
          </View>
        </View>

        {/* Section 3: Pensión Alimenticia */}
        <View style={styles.section}>
          <SectionHeader number={3} title="Pensión Alimenticia" />
          <View style={styles.sectionBody}>
            <InfoRow
              label="Porcentaje aplicado"
              value={`${result.childSupport.percentage}%`}
            />
            <InfoRow
              label="Monto mensual total"
              value={formatMXN(result.childSupport.monthlyTotal)}
            />
            {input.numberOfChildren > 0 ? (
              <>
                <InfoRow
                  label="Monto mensual por hijo"
                  value={formatMXN(result.childSupport.perChildMonthly)}
                />
                {result.childSupport.breakdown.length > 0 ? (
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                        Edad
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                        Alimentos
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
                        Educación
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                        Salud
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                        Vestido
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                        Vivienda
                      </Text>
                      <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>
                        Total
                      </Text>
                    </View>
                    {result.childSupport.breakdown.map((child, idx) => (
                      <View
                        key={idx}
                        style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                      >
                        <Text style={[styles.tableCell, { width: "14%" }]}>
                          {child.childAge} anos
                        </Text>
                        <Text style={[styles.tableCell, { width: "14%" }]}>
                          {formatMXN(child.food)}
                        </Text>
                        <Text style={[styles.tableCell, { width: "15%" }]}>
                          {formatMXN(child.education)}
                        </Text>
                        <Text style={[styles.tableCell, { width: "14%" }]}>
                          {formatMXN(child.health)}
                        </Text>
                        <Text style={[styles.tableCell, { width: "14%" }]}>
                          {formatMXN(child.clothing)}
                        </Text>
                        <Text style={[styles.tableCell, { width: "14%" }]}>
                          {formatMXN(child.housing)}
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            { width: "15%", textAlign: "right", fontFamily: "Helvetica-Bold" },
                          ]}
                        >
                          {formatMXN(child.total)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        </View>

        {/* Section 4: Pensión Compensatoria */}
        <View style={styles.section}>
          <SectionHeader number={4} title="Pensión Compensatoria" />
          <View style={styles.sectionBody}>
            {result.compensatory ? (
              <>
                <InfoRow
                  label="Monto mensual"
                  value={formatMXN(result.compensatory.selectedMonthly)}
                />
                <InfoRow
                  label="Duración estimada"
                  value={`${result.compensatory.durationYears} ${result.compensatory.durationYears === 1 ? "año" : "años"}`}
                />
                <InfoRow
                  label="Total estimado"
                  value={formatMXN(result.compensatory.totalEstimate)}
                />
                <InfoRow
                  label="Estimación conservadora (mensual)"
                  value={formatMXN(result.compensatory.conservative)}
                />
                <InfoRow
                  label="Estimación moderada (mensual)"
                  value={formatMXN(result.compensatory.moderate)}
                />
                <InfoRow
                  label="Estimación agresiva (mensual)"
                  value={formatMXN(result.compensatory.aggressive)}
                />
              </>
            ) : (
              <Text style={styles.naText}>No aplica</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>
            Este documento es una estimación con fines informativos y no
            constituye asesoría legal vinculante. Los montos finales pueden
            variar según las circunstancias del caso y la determinación judicial.
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Section 5: Costos de Salida del Hogar */}
        <View style={styles.section}>
          <SectionHeader number={5} title="Costos de Salida del Hogar" />
          <View style={styles.sectionBody}>
            {result.housing.breakdown.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: "50%" }]}>
                    Concepto
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
                    Tipo
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "25%", textAlign: "right" },
                    ]}
                  >
                    Monto
                  </Text>
                </View>
                {result.housing.breakdown.map((item, idx) => (
                  <View
                    key={idx}
                    style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={[styles.tableCell, { width: "50%" }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.tableCell, { width: "25%" }]}>
                      {item.type === "one-time" ? "Único" : "Mensual"}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: "25%", textAlign: "right" },
                      ]}
                    >
                      {formatMXN(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={{ marginTop: 6 }}>
              <InfoRow
                label="Total único"
                value={formatMXN(result.housing.oneTimeTotal)}
              />
              <InfoRow
                label="Recurrente mensual"
                value={formatMXN(result.housing.monthlyRecurring)}
              />
              <InfoRow
                label="Costo del primer mes"
                value={formatMXN(result.housing.firstMonthTotal)}
              />
            </View>
          </View>
        </View>

        {/* Section 6: Honorarios Legales */}
        <View style={styles.section}>
          <SectionHeader number={6} title="Honorarios Legales" />
          <View style={styles.sectionBody}>
            <InfoRow
              label="Honorarios base"
              value={formatMXN(result.legalFees.baseFee)}
            />
            {result.legalFees.additionalFees.map((fee, idx) => (
              <InfoRow key={idx} label={fee.name} value={formatMXN(fee.amount)} />
            ))}
            <View
              style={[
                styles.infoRow,
                { borderBottomWidth: 0, marginTop: 4 },
              ]}
            >
              <Text
                style={[
                  styles.infoLabel,
                  { fontFamily: "Helvetica-Bold", color: PRIMARY },
                ]}
              >
                Total honorarios
              </Text>
              <Text
                style={[styles.infoValue, { color: PRIMARY, fontSize: 10 }]}
              >
                {formatMXN(result.legalFees.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 7: Resumen de Costos */}
        <View style={styles.section}>
          <SectionHeader number={7} title="Resumen de Costos" />
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total mensual recurrente</Text>
              <Text style={styles.summaryValue}>
                {formatMXN(result.monthlyTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total anual estimado</Text>
              <Text style={styles.summaryValue}>
                {formatMXN(result.annualTotal)}
              </Text>
            </View>
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>
                Costos únicos (una sola vez)
              </Text>
              <Text style={styles.summaryTotalValue}>
                {formatMXN(result.oneTimeCosts)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>
            Este documento es una estimación con fines informativos y no
            constituye asesoría legal vinculante. Los montos finales pueden
            variar según las circunstancias del caso y la determinación judicial.
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 3: Projections */}
      {result.projections.length > 0 ? (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <SectionHeader number={8} title="Proyecciones Multi-anuales" />
            <View style={styles.sectionBody}>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: "10%" }]}>
                    Año
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: "10%" }]}>
                    Calendario
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "16%", textAlign: "right" },
                    ]}
                  >
                    Pensión Alim.
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "16%", textAlign: "right" },
                    ]}
                  >
                    Compensatoria
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "16%", textAlign: "right" },
                    ]}
                  >
                    Vivienda
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "16%", textAlign: "right" },
                    ]}
                  >
                    Total Anual
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: "16%", textAlign: "right" },
                    ]}
                  >
                    Acumulado
                  </Text>
                </View>
                {result.projections.map(
                  (proj: YearlyProjection, idx: number) => (
                    <View
                      key={idx}
                      style={
                        idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt
                      }
                    >
                      <Text style={[styles.tableCell, { width: "10%" }]}>
                        {proj.year}
                      </Text>
                      <Text style={[styles.tableCell, { width: "10%" }]}>
                        {proj.calendarYear}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "16%", textAlign: "right" },
                        ]}
                      >
                        {formatMXN(proj.childSupportAnnual)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "16%", textAlign: "right" },
                        ]}
                      >
                        {formatMXN(proj.compensatoryAnnual)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "16%", textAlign: "right" },
                        ]}
                      >
                        {formatMXN(proj.housingAnnual)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "16%", textAlign: "right" },
                        ]}
                      >
                        {formatMXN(proj.totalAnnual)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            width: "16%",
                            textAlign: "right",
                            fontFamily: "Helvetica-Bold",
                          },
                        ]}
                      >
                        {formatMXN(proj.cumulativeTotal)}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text style={styles.disclaimer}>
              Este documento es una estimacion con fines informativos y no
              constituye asesoria legal vinculante. Los montos finales pueden
              variar segun las circunstancias del caso y la determinacion
              judicial.
            </Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </Page>
      ) : null}
    </Document>
  );
}

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
  },
  businessName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBlock: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1f2937",
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
    color: "#4b5563",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    padding: 6,
    borderRadius: 2,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  colService: { width: "35%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "20%", textAlign: "right" },
  colDiscount: { width: "15%", textAlign: "center" },
  colSubtotal: { width: "20%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

interface QuoteData {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  validUntil: Date | string | null;
  createdAt: Date | string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpfCnpj: string | null;
    address: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    serviceType: {
      id: string;
      name: string;
    };
  }>;
}

export function QuotePdfDocument({ quote }: { quote: QuoteData }) {
  const createdDate = format(new Date(quote.createdAt), "dd/MM/yyyy", { locale: ptBR });
  const validUntilDate = quote.validUntil
    ? format(new Date(quote.validUntil), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.businessName}>AquaWash</Text>
          <Text style={styles.subtitle}>Lavagem Automotiva Profissional</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            <Text style={styles.text}>{quote.customer.name}</Text>
            {quote.customer.email && (
              <Text style={styles.text}>{quote.customer.email}</Text>
            )}
            {quote.customer.phone && (
              <Text style={styles.text}>{quote.customer.phone}</Text>
            )}
            {quote.customer.cpfCnpj && (
              <Text style={styles.text}>CPF/CNPJ: {quote.customer.cpfCnpj}</Text>
            )}
            {quote.customer.address && (
              <Text style={styles.text}>{quote.customer.address}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.sectionTitle}>Dados do Orcamento</Text>
            <Text style={styles.text}>Numero: {quote.quoteNumber}</Text>
            <Text style={styles.text}>Data: {createdDate}</Text>
            {validUntilDate && (
              <Text style={styles.text}>Valido ate: {validUntilDate}</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colService]}>Servico</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Preco Unit.</Text>
            <Text style={[styles.tableHeaderText, styles.colDiscount]}>Desconto</Text>
            <Text style={[styles.tableHeaderText, styles.colSubtotal]}>Subtotal</Text>
          </View>

          {quote.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colService}>{item.serviceType.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colDiscount}>{item.discount}%</Text>
              <Text style={styles.colSubtotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.totalAmount)}</Text>
        </View>

        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Observacoes</Text>
            <Text style={styles.text}>{quote.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          AquaWash - Documento gerado automaticamente em {createdDate}
        </Text>
      </Page>
    </Document>
  );
}

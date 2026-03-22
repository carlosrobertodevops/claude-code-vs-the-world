import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontWeight: "bold" },
  table: { marginTop: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 6, fontWeight: "bold", fontSize: 10 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", fontSize: 10 },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, fontSize: 13, fontWeight: "bold" },
  section: { marginTop: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 4, marginBottom: 8 },
  notes: { marginTop: 12, padding: 8, backgroundColor: "#f9fafb", fontSize: 10 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#999", textAlign: "center" },
});

type QuoteItem = { description: string; quantity: number; unitPrice: number; discount: number; subtotal: number };

export function QuotePdf({ quote }: {
  quote: {
    quoteNumber: string; createdAt: string; totalAmount: number; notes?: string | null;
    customer: { name: string; phone: string; email?: string | null };
    items: QuoteItem[];
  };
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Orcamento {quote.quoteNumber}</Text>
          <Text style={styles.subtitle}>AquaFlow Lava-Jato</Text>
        </View>
        <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text>{quote.customer.name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Telefone:</Text><Text>{quote.customer.phone}</Text></View>
        {quote.customer.email && <View style={styles.row}><Text style={styles.label}>Email:</Text><Text>{quote.customer.email}</Text></View>}
        <View style={styles.row}><Text style={styles.label}>Data:</Text><Text>{new Date(quote.createdAt).toLocaleDateString("pt-BR")}</Text></View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Descricao</Text>
            <Text style={styles.col2}>Qtd</Text>
            <Text style={styles.col3}>Unit.</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>
          {quote.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>R$ {item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.col4}>R$ {item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalRow}><Text>Total: R$ {quote.totalAmount.toFixed(2)}</Text></View>
        {quote.notes && <View style={styles.notes}><Text style={styles.label}>Observacoes:</Text><Text>{quote.notes}</Text></View>}
        <Text style={styles.footer}>AquaFlow - Documento gerado automaticamente</Text>
      </Page>
    </Document>
  );
}

export function ContractPdf({ contract }: {
  contract: {
    contractNumber: string; title: string; content: string; createdAt: string;
    signedAt?: string; signatureIp?: string;
    customer: { name: string; phone: string };
  };
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{contract.title}</Text>
          <Text style={styles.subtitle}>{contract.contractNumber} - AquaFlow Lava-Jato</Text>
        </View>
        <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text>{contract.customer.name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Telefone:</Text><Text>{contract.customer.phone}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Data:</Text><Text>{new Date(contract.createdAt).toLocaleDateString("pt-BR")}</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Termos e Condicoes</Text></View>
        <Text>{contract.content}</Text>

        {contract.signedAt && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Assinatura Digital</Text>
            <View style={styles.row}><Text style={styles.label}>Assinado em:</Text><Text>{new Date(contract.signedAt).toLocaleString("pt-BR")}</Text></View>
            {contract.signatureIp && <View style={styles.row}><Text style={styles.label}>IP:</Text><Text>{contract.signatureIp}</Text></View>}
          </View>
        )}
        <Text style={styles.footer}>AquaFlow - Documento gerado automaticamente</Text>
      </Page>
    </Document>
  );
}

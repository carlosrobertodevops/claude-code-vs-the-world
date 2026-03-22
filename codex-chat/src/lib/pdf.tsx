import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1 solid #e2e8f0",
    paddingBottom: 8,
    marginBottom: 8,
  },
});

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export async function buildQuotePdf(input: {
  businessName: string;
  quoteNumber: string;
  customerName: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: LineItem[];
}) {
  return renderToBuffer(
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{input.businessName}</Text>
          <Text>Orcamento {input.quoteNumber}</Text>
          <Text>Cliente: {input.customerName}</Text>
          <Text>Emitido em: {input.createdAt}</Text>
          <Text>Status: {input.status}</Text>
        </View>
        <View style={styles.section}>
          {input.items.map((item) => (
            <View style={styles.row} key={`${item.description}-${item.subtotal}`}>
              <Text>{item.description} x{item.quantity}</Text>
              <Text>R$ {item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <Text>Total: R$ {input.totalAmount.toFixed(2)}</Text>
      </Page>
    </Document>,
  );
}

export async function buildContractPdf(input: {
  businessName: string;
  contractNumber: string;
  customerName: string;
  title: string;
  content: string;
  signedAt?: string | null;
}) {
  return renderToBuffer(
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{input.businessName}</Text>
          <Text>Contrato {input.contractNumber}</Text>
          <Text>Cliente: {input.customerName}</Text>
          <Text>Titulo: {input.title}</Text>
        </View>
        <View style={styles.section}>
          <Text>{input.content}</Text>
        </View>
        <Text>Assinado em: {input.signedAt ?? "Pendente"}</Text>
      </Page>
    </Document>,
  );
}

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import type { Quote } from "@/types/domain";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, color: "#0f172a" },
  heading: { fontSize: 20, marginBottom: 12 },
  row: { marginBottom: 8 },
  items: { marginTop: 16 },
});

export async function generateQuotePdfUseCase(quote: Quote) {
  return renderToBuffer(
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Orcamento LavaFlow</Text>
        <View style={styles.row}>
          <Text>ID: {quote.id}</Text>
          <Text>Status: {quote.status}</Text>
        </View>
        <View style={styles.items}>
          {quote.items.map((item) => (
            <Text key={item.id}>
              {item.description} · {item.quantity} x {item.unitPrice}
            </Text>
          ))}
        </View>
        <Text style={styles.row}>Total: {quote.total}</Text>
      </Page>
    </Document>,
  );
}

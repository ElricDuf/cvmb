import React from 'react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { margin: 10, padding: 10 }
})

const MyDoc = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>CVMB - Exemple de PDF généré avec react-pdf</Text>
      </View>
    </Page>
  </Document>
)

export default function SimplePdf() {
  return (
    <div>
      <PDFDownloadLink document={<MyDoc />} fileName="cvmb-example.pdf">
        {({ loading }) => (loading ? 'Génération...' : 'Télécharger PDF exemple')}
      </PDFDownloadLink>
    </div>
  )
}

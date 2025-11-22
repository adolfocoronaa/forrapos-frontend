import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Venta } from '../components/ventas/venta.model';
import { Compra } from '../components/compras/compra.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  generarPdf(venta: Venta): jsPDF {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Reporte de Venta - ${venta.folio}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 14, 30);
    doc.text(`Método de Pago: ${venta.metodoPago}`, 14, 38);
    doc.text(`Total: $${venta.total.toFixed(2)}`, 14, 46);

    let y = 54;
    if (venta.cliente) {
      doc.text("Datos fiscales:", 14, y);
      doc.text(`Nombre o razón social: ${venta.cliente}`, 14, y += 8);
      if (venta.rfc) doc.text(`RFC: ${venta.rfc}`, 14, y += 8);
      if (venta.direccionFiscal) doc.text(`Dirección fiscal: ${venta.direccionFiscal}`, 14, y += 8);
      if (venta.correoFactura) doc.text(`Correo: ${venta.correoFactura}`, 14, y += 8);
      if (venta.usoCfdi) doc.text(`Uso de CFDI: ${venta.usoCfdi}`, 14, y += 8);
      y += 4;
    }

    autoTable(doc, {
      startY: y + 4,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
      body: venta.detalles.map(d => [
        d.producto,
        d.cantidad.toString(),
        `$${d.precioUnitario.toFixed(2)}`,
        `$${d.subtotal.toFixed(2)}`
      ])
    });

    return doc;
  }

  generarPdfCompra(compra: Compra): jsPDF {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Reporte de Venta - ${compra.folio}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(compra.fecha).toLocaleString()}`, 14, 30);
    doc.text(`Método de Pago: ${compra.metodoPago}`, 14, 38);
    doc.text(`Total: $${compra.total.toFixed(2)}`, 14, 46);

    let y = 54;

    autoTable(doc, {
      startY: y + 4,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
      body: compra.detalles.map(d => [
        d.producto,
        d.cantidad.toString(),
        `$${d.precioUnitario.toFixed(2)}`,
        `$${d.subtotal.toFixed(2)}`
      ])
    });

    return doc;
  }
}

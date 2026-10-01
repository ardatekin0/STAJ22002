import type { Invoice, Account, Customer } from '../types';
import { formatCurrency, formatDate, formatDateOnly } from './formatters';

export interface InvoicePdfOptions {
  invoice: Invoice;
  account?: Account | null;
  customer?: Customer | null;
}

export function generateInvoicePdf({ invoice, account, customer }: InvoicePdfOptions): void {
  const invoiceId = invoice.invoiceId || invoice.id || '-';
  const period = invoice.billingPeriod || '-';
  const createdAt = formatDate(invoice.createdAt);
  const lastPayment = formatDateOnly(invoice.lastPaymentDate);

  const resolvedCustomer = customer || invoice.customer || account?.customer;
  const customerName = resolvedCustomer
    ? `${resolvedCustomer.customerName || ''} ${resolvedCustomer.customerLastName || ''}`.trim()
    : 'Kayıtlı Abone';
  const customerType = resolvedCustomer?.customerType === 'INDIVIDUAL'
    ? 'Bireysel'
    : resolvedCustomer?.customerType === 'CORPORATE'
    ? 'Kurumsal'
    : null;
  const identityNumber = resolvedCustomer?.tckn || resolvedCustomer?.vkn || null;
  const identityLabel = resolvedCustomer?.customerType === 'CORPORATE' ? 'VKN' : 'TCKN';

  const accountId = invoice.accountId ?? invoice.account?.accountId ?? account?.accountId;
  const accountName = invoice.account?.accountName || account?.accountName;

  const noTaxTotal = formatCurrency(invoice.noTaxTotalPrice ?? 0);
  const noTaxDiscount = formatCurrency(invoice.noTaxTotalDiscountPrice ?? 0);
  const totalDiscount = formatCurrency(invoice.totalDiscountPrice ?? 0);
  const totalTax = formatCurrency(invoice.totalTaxPrice ?? 0);
  const grandTotal = formatCurrency(invoice.totalPrice ?? 0);

  const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Fatura_${invoiceId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-type {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-number {
      font-size: 14px;
      font-weight: 700;
      color: #4f46e5;
      margin-top: 4px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    .meta-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 18px;
    }
    .meta-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 12px;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      color: #64748b;
    }
    .meta-val {
      font-weight: 600;
      color: #0f172a;
    }

    .table-container {
      margin-bottom: 25px;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .invoice-table th {
      background-color: #4f46e5;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 10px 14px;
      border: 1px solid #4f46e5;
    }
    .invoice-table th:last-child {
      text-align: right;
    }
    .invoice-table td {
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      font-size: 12.5px;
    }
    .invoice-table td:last-child {
      text-align: right;
    }
    .invoice-table tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .summary-grid {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .summary-box {
      width: 320px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 18px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 12.5px;
      color: #334155;
      border-bottom: 1px dashed #e2e8f0;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .summary-row.discount {
      color: #16a34a;
    }
    .summary-row.grand-total {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 2px solid #4f46e5;
      font-size: 15px;
      font-weight: 800;
      color: #4f46e5;
    }

    .due-box {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .due-label {
      font-size: 12px;
      font-weight: 700;
      color: #b91c1c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .due-val {
      font-size: 14px;
      font-weight: 800;
      color: #b91c1c;
    }

    .invoice-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
      line-height: 1.6;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="invoice-header">
      <div>
        <div class="brand-title">AuthApp Telecom</div>
        <div class="brand-subtitle">Telekom Yönetim Portalı & E-Fatura Sistemi</div>
      </div>
      <div class="invoice-badge">
        <div class="invoice-type">Hizmet Faturası</div>
        <div class="invoice-number">Fatura No: ${invoiceId}</div>
      </div>
    </div>

    <!-- Meta Details Grid -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-title">Abone & Müşteri Bilgileri</div>
        <div class="meta-row">
          <span class="meta-label">Müşteri / Unvan:</span>
          <span class="meta-val">${customerName}</span>
        </div>
        ${customerType ? `
        <div class="meta-row">
          <span class="meta-label">Müşteri Tipi:</span>
          <span class="meta-val">${customerType}</span>
        </div>` : ''}
        ${identityNumber ? `
        <div class="meta-row">
          <span class="meta-label">${identityLabel}:</span>
          <span class="meta-val">${identityNumber}</span>
        </div>` : ''}
        ${accountId ? `
        <div class="meta-row">
          <span class="meta-label">Hesap No / Adı:</span>
          <span class="meta-val">Hesap ${accountId} ${accountName ? `(${accountName})` : ''}</span>
        </div>` : ''}
      </div>

      <div class="meta-card">
        <div class="meta-title">Fatura Detayları</div>
        <div class="meta-row">
          <span class="meta-label">Fatura No:</span>
          <span class="meta-val">${invoiceId}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Fatura Dönemi:</span>
          <span class="meta-val">${period}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Düzenleme Tarihi:</span>
          <span class="meta-val">${createdAt}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Son Ödeme Tarihi:</span>
          <span class="meta-val" style="color: #b91c1c;">${lastPayment}</span>
        </div>
      </div>
    </div>

    <!-- Due Date Alert Box -->
    <div class="due-box">
      <span class="due-label">Son Ödeme Tarihi</span>
      <span class="due-val">${lastPayment}</span>
    </div>

    <!-- Items Table -->
    <div class="table-container">
      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width: 50%;">Hizmet / Kalem Açıklaması</th>
            <th style="text-align: center; width: 15%;">Dönem</th>
            <th style="text-align: right; width: 15%;">KDV Oranı</th>
            <th style="text-align: right; width: 20%;">Tutar (KDV Hariç)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style="font-weight: 600; color: #0f172a;">Telekomünikasyon ve Abonelik Hizmet Bedeli</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Dönemsel tarife ve paket kullanım bedeli</div>
            </td>
            <td style="text-align: center;">${period}</td>
            <td style="text-align: right;">%20</td>
            <td>${noTaxTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Financial Summary -->
    <div class="summary-grid">
      <div class="summary-box">
        <div class="summary-row">
          <span>Vergisiz Tutar:</span>
          <span>${noTaxTotal}</span>
        </div>
        ${invoice.noTaxTotalDiscountPrice ? `
        <div class="summary-row discount">
          <span>Vergisiz İndirim:</span>
          <span>-${noTaxDiscount}</span>
        </div>` : ''}
        ${invoice.totalDiscountPrice ? `
        <div class="summary-row discount">
          <span>Toplam İndirim Tutarı:</span>
          <span>-${totalDiscount}</span>
        </div>` : ''}
        <div class="summary-row">
          <span>Hesaplanan KDV (Vergi):</span>
          <span>${totalTax}</span>
        </div>
        <div class="summary-row grand-total">
          <span>ÖDENECEK TOPLAM:</span>
          <span>${grandTotal}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <p>Bu belge AuthApp Telecom Portalı üzerinden elektronik ortamda oluşturulmuş resmi fatura bilgilendirmesidir.</p>
      <p>Ödemelerinizi son ödeme tarihine kadar anlaşmalı bankalar ve portal üzerinden gerçekleştirebilirsiniz.</p>
      <p style="margin-top: 4px; font-weight: 600;">© 2026 AuthApp Telecom. Tüm hakları saklıdır.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 60000);
  }
}

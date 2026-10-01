import type { Column } from '../components/common/DataTable';

function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function isColumnExportable<T>(col: Column<T>): boolean {
  if (col.exportable === false) return false;

  const headerNormalized = col.header.trim().toLocaleLowerCase('tr-TR');
  if (
    headerNormalized.includes('işlem') ||
    headerNormalized.includes('islem') ||
    headerNormalized.includes('action') ||
    headerNormalized.includes('aksiyon')
  ) {
    return false;
  }

  if (!col.key && !col.sortAccessor && !col.exportValue) {
    return false;
  }

  return true;
}

export function getColumnExportValue<T>(item: T, col: Column<T>): { value: string | number; isNumber: boolean } {
  if (col.exportValue) {
    const raw = col.exportValue(item);
    if (typeof raw === 'number') {
      return { value: raw, isNumber: true };
    }
    return { value: raw !== null && raw !== undefined ? String(raw) : '', isNumber: false };
  }

  if (col.sortAccessor) {
    const raw = col.sortAccessor(item);
    if (typeof raw === 'number') {
      return { value: raw, isNumber: true };
    }
    if (raw instanceof Date) {
      return { value: raw.toLocaleDateString('tr-TR'), isNumber: false };
    }
    if (typeof raw === 'boolean') {
      return { value: raw ? 'Evet' : 'Hayır', isNumber: false };
    }
    return { value: raw !== null && raw !== undefined ? String(raw) : '', isNumber: false };
  }

  if (col.key) {
    const raw = (item as Record<string, unknown>)[col.key as string];
    if (typeof raw === 'number') {
      return { value: raw, isNumber: true };
    }
    if (raw instanceof Date) {
      return { value: raw.toLocaleDateString('tr-TR'), isNumber: false };
    }
    if (typeof raw === 'boolean') {
      return { value: raw ? 'Evet' : 'Hayır', isNumber: false };
    }
    return { value: raw !== null && raw !== undefined ? String(raw) : '', isNumber: false };
  }

  return { value: '', isNumber: false };
}

export function exportToExcel<T>(
  data: T[],
  columns: Column<T>[],
  fileName: string = 'export'
): void {
  const exportableCols = columns.filter(isColumnExportable);

  if (exportableCols.length === 0 || data.length === 0) {
    return;
  }

  const cleanFileName = (fileName.endsWith('.xls') ? fileName : `${fileName}.xls`)
    .replace(/[\\/:*?"<>|]/g, '_');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>AuthApp Telecom</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="DataCellNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="10" ss:Color="#0F172A"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rapor">
  <Table ss:DefaultRowHeight="20">
`;

  for (const col of exportableCols) {
    const width = col.width ? parseInt(col.width, 10) : 120;
    xml += `   <Column ss:AutoFitWidth="1" ss:Width="${Math.max(80, isNaN(width) ? 120 : width)}" />\n`;
  }

  xml += '   <Row ss:Height="24" ss:StyleID="Header">\n';
  for (const col of exportableCols) {
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
  }
  xml += '   </Row>\n';

  for (const item of data) {
    xml += '   <Row ss:Height="20">\n';
    for (const col of exportableCols) {
      const { value, isNumber } = getColumnExportValue(item, col);
      if (isNumber) {
        xml += `    <Cell ss:StyleID="DataCellNumber"><Data ss:Type="Number">${value}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>\n`;
      }
    }
    xml += '   </Row>\n';
  }

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadBatchCustomerTemplate(): void {
  const headers = ['customerName', 'customerLastName', 'customerType', 'tckn', 'vkn'];
  const fileName = 'musteri_toplu_yukleme_sablonu.xls';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>AuthApp Telecom</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="162" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Müşteri_Şablonu">
  <Table ss:DefaultRowHeight="20">
   <Column ss:AutoFitWidth="1" ss:Width="140" />
   <Column ss:AutoFitWidth="1" ss:Width="140" />
   <Column ss:AutoFitWidth="1" ss:Width="130" />
   <Column ss:AutoFitWidth="1" ss:Width="130" />
   <Column ss:AutoFitWidth="1" ss:Width="130" />
   <Row ss:Height="24" ss:StyleID="Header">
`;

  for (const h of headers) {
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  }

  xml += `   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

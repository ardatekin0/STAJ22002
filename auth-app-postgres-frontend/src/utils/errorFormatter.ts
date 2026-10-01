export function formatErrorMessage(rawMessage: string, context?: 'tariff' | 'discount' | 'customer' | 'account' | 'product' | 'batch' | 'invoice' | 'role'): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.';
  }

  const msg = rawMessage.trim();

  if (msg === 'Failed to fetch' || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Ağ bağlantı hatası')) {
    return 'Sunucuya bağlanılamadı. Lütfen backend servisinin çalıştığından emin olunuz.';
  }

  if (context === 'tariff' || msg.includes('İndirim geçerlilik başlangıç tarihi') && context !== 'discount') {
    if (msg.includes('İndirim geçerlilik başlangıç tarihi')) {
      return msg.replace('İndirim geçerlilik başlangıç tarihi', 'Tarife geçerlilik başlangıç tarihi');
    }
    if (msg.includes('İndirim bitiş tarihi')) {
      return msg.replace('İndirim bitiş tarihi', 'Tarife bitiş tarihi');
    }
  }

  if (msg.includes('TCKN zaten mevcut')) {
    const match = msg.match(/\d{11}/);
    if (match) {
      return `${match[0]} TCKN numaralı müşteri zaten sistemde kayıtlı.`;
    }
    return 'Bu TCKN numarasına sahip bir müşteri zaten sistemde kayıtlı.';
  }

  if (msg.includes('VKN zaten mevcut')) {
    const match = msg.match(/\d{10}/);
    if (match) {
      return `${match[0]} VKN numaralı kurumsal müşteri zaten sistemde kayıtlı.`;
    }
    return 'Bu VKN numarasına sahip bir müşteri zaten sistemde kayıtlı.';
  }

  if (msg.includes('Customer id bulunamadı') || msg.includes('Customer bulunamadı') || msg.includes('Müşteri bulunamadı')) {
    return 'Belirtilen müşteri kaydı sistemde bulunamadı.';
  }

  if (msg.includes('Account id bulunamadı') || msg.includes('Account bulunamadı') || msg.includes('Hesap bulunamadı')) {
    return 'Belirtilen hesap kaydı sistemde bulunamadı.';
  }

  if (msg.includes('Product id bulunamadı') || msg.includes('Product bulunamadı') || msg.includes('Ürün bulunamadı')) {
    return 'Belirtilen ürün kaydı sistemde bulunamadı.';
  }

  if (msg.includes('Tariff id bulunamadı') || msg.includes('Tariff bulunamadı') || msg.includes('Tarife bulunamadı')) {
    return 'Belirtilen tarife kaydı sistemde bulunamadı.';
  }

  if (msg.includes('Discount id bulunamadı') || msg.includes('Discount bulunamadı') || msg.includes('İndirim bulunamadı')) {
    return 'Belirtilen indirim kaydı sistemde bulunamadı.';
  }

  if (msg.includes('Invoice id bulunamadı') || msg.includes('Invoice bulunamadı') || msg.includes('Fatura bulunamadı')) {
    return 'Belirtilen fatura kaydı sistemde bulunamadı.';
  }

  if (
    msg.includes('UncategorizedSQLException') ||
    msg.includes('PreparedStatementCallback') ||
    msg.includes('PL/pgSQL') ||
    msg.includes('SQLState') ||
    msg.includes('org.springframework') ||
    msg.includes('org.hibernate') ||
    msg.includes('JDBC exception') ||
    msg.includes('PSQLException') ||
    msg.includes('SQLException') ||
    msg.includes('org.postgresql') ||
    msg.includes('DataIntegrityViolationException') ||
    msg.includes('ConstraintViolationException') ||
    msg.includes('TransactionSystemException')
  ) {

    const errorMatch = msg.match(/ERROR:\s*([^\n\r]+)/i);
    if (errorMatch && errorMatch[1]) {
      const dbErr = errorMatch[1].trim();
      if (dbErr.includes('TCKN zaten mevcut')) {
        const tcknMatch = dbErr.match(/\d{11}/);
        return tcknMatch
          ? `${tcknMatch[0]} TCKN numaralı müşteri zaten sistemde kayıtlı.`
          : 'Bu TCKN numaralı müşteri zaten sistemde kayıtlı.';
      }
      if (dbErr.includes('VKN zaten mevcut')) {
        const vknMatch = dbErr.match(/\d{10}/);
        return vknMatch
          ? `${vknMatch[0]} VKN numaralı kurumsal müşteri zaten sistemde kayıtlı.`
          : 'Bu VKN numaralı müşteri zaten sistemde kayıtlı.';
      }
      if (dbErr.includes('Product değiştirilemez')) {
        return 'Ürün tarifesi veya indiriminde bağlı ürün değiştirilemez.';
      }
      if (dbErr.includes('Bu product için aktif ProductTariff bulunmalıdır')) {
        return 'İndirim uygulanabilmesi için ürünün öncelikle aktif bir tarifeye sahip olması gerekmektedir.';
      }
      if (dbErr.includes('Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır')) {
        return 'Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır.';
      }
      return dbErr;
    }
    return 'İşlem sırasında beklenmeyen bir veritabanı hatası oluştu. Lütfen bilgileri kontrol edip tekrar deneyiniz.';
  }

  if (msg.includes('Product değiştirilemez')) {
    return 'Ürün tarifesi veya indiriminde bağlı ürün değiştirilemez.';
  }

  if (msg.includes('Bu product için aktif ProductTariff bulunmalıdır')) {
    return 'İndirim uygulanabilmesi için ürünün öncelikle aktif bir tarifeye sahip olması gerekmektedir.';
  }

  if (msg.includes('Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır')) {
    return 'Yeni başlangıç tarihi mevcut başlangıç tarihinden sonra olmalıdır.';
  }

  return msg;
}

export const NAME_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ]+(?:\s+[a-zA-ZçÇğĞıİöÖşŞüÜ]+)*$/;
export const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const TCKN_REGEX = /^\d{11}$/;
export const VKN_REGEX = /^\d{10}$/;

export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Bu alan boş bırakılamaz.';
  }
  if (!NAME_REGEX.test(name.trim())) {
    return 'Sadece harflerden oluşmalı ve geçerli formatta olmalıdır.';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'E-posta boş bırakılamaz.';
  }
  if (/\s/.test(email)) {
    return 'E-posta adresi boşluk içeremez.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Geçerli bir e-posta adresi giriniz.';
  }
  return null;
};

export const validateTckn = (tckn: string): string | null => {
  if (!tckn || !tckn.trim()) {
    return 'TCKN boş bırakılamaz.';
  }
  if (!TCKN_REGEX.test(tckn.trim())) {
    return 'TCKN tam 11 haneli rakamlardan oluşmalıdır.';
  }
  return null;
};

export const validateVkn = (vkn: string): string | null => {
  if (!vkn || !vkn.trim()) {
    return 'VKN boş bırakılamaz.';
  }
  if (!VKN_REGEX.test(vkn.trim())) {
    return 'VKN tam 10 haneli rakamlardan oluşmalıdır.';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Şifre boş bırakılamaz.';
  }
  if (/\s/.test(password)) {
    return 'Şifre boşluk içeremez.';
  }
  if (password.length < 6) {
    return 'Şifre en az 6 karakter olmalıdır.';
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return 'Kullanıcı adı boş bırakılamaz.';
  }
  if (/\s/.test(username)) {
    return 'Kullanıcı adı boşluk içeremez.';
  }
  if (username.length < 3) {
    return 'Kullanıcı adı en az 3 karakter olmalıdır.';
  }
  return null;
};

export const validatePrice = (price: number | string): string | null => {
  const num = Number(price);
  if (isNaN(num) || num <= 0) {
    return 'Tutar 0\'dan büyük olmalıdır.';
  }
  return null;
};

export const validatePercentage = (percentage: number | string): string | null => {
  const num = Number(percentage);
  if (isNaN(num) || num < 0 || num > 100) {
    return 'Yüzdesel indirim 0 ile 100 arasında olmalıdır.';
  }
  return null;
};

export const validateDateRange = (startDateStr: string, endDateStr: string): string | null => {
  if (!startDateStr) {
    return 'Başlangıç tarihi boş olamaz.';
  }
  if (!endDateStr) {
    return 'Bitiş tarihi boş olamaz.';
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Geçerli bir tarih giriniz.';
  }

  if (end <= start) {
    return 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.';
  }

  return null;
};

export const validateFutureOrTodayDate = (dateStr: string): string | null => {
  if (!dateStr) {
    return 'Tarih boş olamaz.';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'Geçerli bir tarih giriniz.';
  }
  return null;
};

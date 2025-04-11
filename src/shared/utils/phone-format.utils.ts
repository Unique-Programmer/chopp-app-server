export const formatPhoneNumber = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  digits = digits.replace(/^7/, '8');
  return digits;
};

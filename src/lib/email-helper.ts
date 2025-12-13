/**
 * Helper pour formater les adresses email internes ExiledRP
 * Format: username@exiledrpstaff.com
 */

export const formatInternalEmail = (username: string): string => {
  // Nettoyer le username (enlever les caractères spéciaux, espaces, etc.)
  const cleanUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\s+/g, "");
  return `${cleanUsername}@exiledrpstaff.com`;
};

export const parseInternalEmail = (email: string): string | null => {
  const match = email.match(/^([^@]+)@exiledrpstaff\.com$/);
  return match ? match[1] : null;
};

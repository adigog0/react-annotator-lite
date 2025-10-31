export const getUserNameInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== "string") {
    return "";
  }

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "";
  }

  const firstInitial = nameParts[0].charAt(0).toUpperCase();

  let lastInitial = "";

  if (nameParts.length > 1) {
    const lastNamePart = nameParts[nameParts.length - 1];
    lastInitial = lastNamePart.charAt(0).toUpperCase();
  }

  return firstInitial + lastInitial;
};

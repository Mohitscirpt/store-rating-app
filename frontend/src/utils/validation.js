export const validateName = (name) => {
  if (!name || name.length < 20 || name.length > 60) {
    return { isValid: false, error: 'Name must be between 20 and 60 characters' };
  }
  return { isValid: true };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) {
    return { isValid: false, error: 'Password must be between 8 and 16 characters' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasSpecialChar) {
    return { isValid: false, error: 'Password must include at least one uppercase letter and one special character' };
  }
  
  return { isValid: true };
};

export const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return { isValid: false, error: 'Address must not exceed 400 characters' };
  }
  return { isValid: true };
};

export const validateRating = (rating) => {
  const numRating = parseInt(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' };
  }
  return { isValid: true };
};

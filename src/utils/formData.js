export const buildFormData = (payload) => {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) fd.append(key, item);
      });
      return;
    }
    fd.append(key, value);
  });

  return fd;
};
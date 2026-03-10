export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, defaultValue) {

  const data = localStorage.getItem(key);

  if (!data) return defaultValue;

  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }

}
export const filterData = <T>(data?: (T | null | undefined)[] | null) =>
  data ? (data.filter((item) => item) as T[]) : [];

export const compareByName = <T extends { name: string }>(a: T, b: T) => {
  const aHasStar = a.name.includes('※');
  const bHasStar = b.name.includes('※');

  if (aHasStar && !bHasStar) return -1; // a with ※ comes first
  if (!aHasStar && bHasStar) return 1;  // b with ※ comes first

  // If neither or both have ※, fallback to regular name comparison
  return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
};


function sanitize(text: string): string {
  return text.replace(/\s+/g, " ");

}

export { sanitize };

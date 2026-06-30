function buildScript(storageKey: string) {
  return `
(function () {
  try {
    var stored = localStorage.getItem("${storageKey}");
    var isDark = stored === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;
}

export function ThemeScript({ storageKey }: { storageKey: string }) {
  return <script dangerouslySetInnerHTML={{ __html: buildScript(storageKey) }} />;
}

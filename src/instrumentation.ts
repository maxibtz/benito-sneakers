// Railway corre `next start` como un proceso que queda vivo (no serverless),
// así que este intervalo persiste. register() se ejecuta una vez al arrancar
// el servidor; getUsdRate() internamente solo pega a la API si ya pasaron
// ~20hs desde la última vez, así que llamarla seguido no cuesta nada.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getUsdRate } = await import("@/lib/usd-rate");

  getUsdRate().catch((err) => console.error("[instrumentation] error cotización dólar inicial:", err));

  setInterval(
    () => {
      getUsdRate().catch((err) => console.error("[instrumentation] error cotización dólar:", err));
    },
    6 * 60 * 60 * 1000
  );
}

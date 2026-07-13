export default function HeroSection() {
  return (
    <section className="mb-6 sm:mb-8">
      <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs sm:text-sm text-muted-foreground mb-4">
        Reportado por estudiantes, en tiempo real
      </span>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight max-w-2xl">
        ¿Dónde hay lugar ahora mismo?
      </h2>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
        Mirá la ocupación de bibliotecas, comedores y salas antes de cruzar el campus.
        Tocá un lugar para reportar cómo lo ves vos.
      </p>
    </section>
  );
}

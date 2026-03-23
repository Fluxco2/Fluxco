import { Compass, Search, Truck, Wrench, ClipboardCheck, HeadphonesIcon } from "lucide-react";

const services = [
  {
    icon: Compass,
    title: "Engineering",
    description: "Expert consultation to determine the right specifications for your application.",
  },
  {
    icon: Search,
    title: "Procurement",
    description: "Access our global network to find the best quality, price, and lead time.",
  },
  {
    icon: Truck,
    title: "Logistics",
    description: "End-to-end shipping coordination from factory to your site.",
  },
  {
    icon: Wrench,
    title: "Installation",
    description: "Professional installation services with certified technicians.",
  },
  {
    icon: ClipboardCheck,
    title: "Commissioning",
    description: "Complete testing and commissioning to ensure peak performance.",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support",
    description: "Lifetime technical support and maintenance services.",
  },
];

const TechnologySection = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      <div className="absolute inset-0 circuit-pattern opacity-5" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            FULL-SERVICE PROCUREMENT
          </h2>
          <p className="text-muted-foreground text-lg">
            Engineering, Procurement & Construction—all under one roof.
          </p>
        </div>

        {/* Video Showcase */}
        <div className="mb-16 rounded-2xl overflow-hidden border border-border shadow-2xl relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto aspect-video object-cover brightness-50"
          >
            <source src="/videos/technology-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-display text-3xl md:text-5xl text-foreground mb-4">Global Reach, Local Service</h3>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto px-4">From sourcing to installation, we manage every step of your transformer project.</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group card-gradient border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_hsl(205_100%_50%/0.1)]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;

import { useLocation, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Stethoscope, ArrowRight, MessageCircle, Home, BookOpen, MapPin, HelpCircle, Compass } from "lucide-react";

const KNOWN_ROUTES = [
  "/", "/about", "/faq", "/blog", "/auth",
  "/services", "/services/elder-care", "/services/dementia-care", "/services/live-in-care", "/services/post-surgery-care",
  "/locations", "/locations/port-of-spain", "/locations/san-fernando", "/locations/arima", "/locations/tobago", "/locations/diamond-vale",
  "/dashboard/family", "/dashboard/professional", "/dashboard/community", "/dashboard/admin",
];

function suggestRoute(pathname: string): string | null {
  if (!pathname || pathname === "/") return null;
  // Normalize: lowercase, strip trailing slash
  let p = pathname.toLowerCase().replace(/\/+$/, "");

  // Common singular → plural typos
  p = p
    .replace(/^\/service(\/|$)/, "/services$1")
    .replace(/^\/location(\/|$)/, "/locations$1")
    .replace(/^\/blogs(\/|$)/, "/blog$1")
    .replace(/^\/post(\/|$)/, "/blog$1")
    .replace(/^\/posts(\/|$)/, "/blog$1")
    .replace(/^\/sign-?in(\/|$)/, "/auth$1")
    .replace(/^\/sign-?up(\/|$)/, "/auth$1")
    .replace(/^\/login(\/|$)/, "/auth$1")
    .replace(/^\/register(\/|$)/, "/auth$1");

  if (KNOWN_ROUTES.includes(p)) return p;

  // For nested paths under /blog/*, suggest blog index
  if (p.startsWith("/blog/")) return "/blog";
  if (p.startsWith("/services/")) return "/services";
  if (p.startsWith("/locations/")) return "/locations";

  return null;
}

const WHATSAPP_HELP_URL = `https://api.whatsapp.com/send/?phone=18687865357&text=${encodeURIComponent(
  "Hi Tavara! I landed on a page that couldn't be found and need a little help finding what I'm looking for."
)}&type=phone_number&app_absent=0`;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggested = useMemo(() => suggestRoute(location.pathname), [location.pathname]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Page not found", href: location.pathname, current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-10 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Page not found
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-foreground">
            We couldn't find that page, but we can still help.
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're arranging care for a loved one or you're a caregiver looking for
            your next family, you're in the right place.
          </p>
        </div>

        {suggested && (
          <Card className="mt-8 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <Compass className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Did you mean</p>
                  <p className="font-medium text-foreground break-all">{suggested}?</p>
                </div>
              </div>
              <Link to={suggested} className="shrink-0">
                <Button className="w-full sm:w-auto">
                  Go there
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Arranging care for a loved one
              </h2>
              <p className="mt-2 text-sm text-muted-foreground flex-1">
                Tell us about your situation and we'll match you with a care team in
                Trinidad &amp; Tobago.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link to="/auth">
                  <Button className="w-full">
                    Find care
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to="/services/elder-care"
                  className="text-sm text-primary hover:underline text-center"
                >
                  Explore care services
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                I'm a caregiver
              </h2>
              <p className="mt-2 text-sm text-muted-foreground flex-1">
                Join Tavara to be matched with families who need your skills and to manage
                your shifts in one place.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link to="/auth">
                  <Button className="w-full">
                    Join as a caregiver
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  to="/about"
                  className="text-sm text-primary hover:underline text-center"
                >
                  Learn about Tavara
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center mb-4">
            Quick links
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: "/", label: "Home", Icon: Home },
              { to: "/services", label: "Services", Icon: Heart },
              { to: "/locations", label: "Locations", Icon: MapPin },
              { to: "/blog", label: "Blog", Icon: BookOpen },
              { to: "/faq", label: "FAQ", Icon: HelpCircle },
            ].map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Message us on WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-10 mb-8 text-center text-sm text-muted-foreground max-w-xl mx-auto">
          Still stuck?{" "}
          <a
            href={WHATSAPP_HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Message the Tavara team on WhatsApp
          </a>{" "}
          and we'll point you the right way.
        </p>
      </div>
    </div>
  );
};

export default NotFound;

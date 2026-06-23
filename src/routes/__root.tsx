import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Prescripto AI — Understand your prescriptions, instantly" },
      { name: "description", content: "Upload a prescription and let AI explain your medicines, doses, side effects, and find doctors near you." },
      { name: "author", content: "Prescripto AI" },
      { property: "og:title", content: "Prescripto AI — Understand your prescriptions, instantly" },
      { property: "og:description", content: "Upload a prescription and let AI explain your medicines, doses, side effects, and find doctors near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Prescripto AI — Understand your prescriptions, instantly" },
      { name: "twitter:description", content: "Upload a prescription and let AI explain your medicines, doses, side effects, and find doctors near you." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c24671a3-1b8a-4053-8c6f-a174d5b53021/id-preview-3b2d7350--31fc50b1-4306-4d4c-a18c-d03f3d2ad645.lovable.app-1782200705968.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c24671a3-1b8a-4053-8c6f-a174d5b53021/id-preview-3b2d7350--31fc50b1-4306-4d4c-a18c-d03f3d2ad645.lovable.app-1782200705968.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <div className="animate-page-enter">
        <Outlet />
      </div>
      <Toaster position="top-center" />
    </>
  );
}
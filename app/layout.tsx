import "./globals.css";

export const metadata = {
  title: "Project OS",
  description: "Interior change approval OS"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

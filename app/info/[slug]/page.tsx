import { StoreShell } from "@/components/storefront";
import { FooterContacts, FooterSocials } from "@/components/footer-contact";
import Link from "next/link";
import { notFound } from "next/navigation";
const pages: Record<string, { title: string; content: React.ReactNode }> = {
  about: {
    title: "Our little story.",
    content: (
      <>
        <p>
          AJ Baby Shop began with a simple idea: the everyday things we choose
          for our children can be as beautiful as the moments we share with
          them.
        </p>
        <p>
          We bring together soft essentials, thoughtful gifts, and practical
          pieces for growing families. Our collection is chosen with care, with
          an eye for gentle textures, lovely details, and everyday usefulness.
        </p>
        <h2>From our family, to yours.</h2>
        <p>
          We’re building a little place for the big adventure of parenthood.
          Thank you for letting us be a small part of your family’s story.
        </p>
        <Link href="/shop">Discover the collection →</Link>
      </>
    ),
  },
  delivery: {
    title: "A little love, delivered.",
    content: (
      <>
        <h2>Delivery in Kenya</h2>
        <p>
          Standard delivery is KSh 350. Delivery is free when your merchandise
          subtotal reaches KSh 5,000, before discounts. Confirm your full
          address and phone number at checkout.
        </p>
        <p>
          Delivery timing depends on your location and will be confirmed after
          your order is accepted. Please keep your order number handy when
          asking about a delivery.
        </p>
        <h2>Cash on delivery</h2>
        <p>
          No online payment is collected. Pay the final order total when your
          delivery arrives.
        </p>
        <h2>Returns & order changes</h2>
        <p>
          Please contact the shop before sending an item back or changing an
          order. Keep items unused with original packaging and include your
          order number. Damaged or incorrect items should be reported promptly
          with a description and photos.
        </p>
        <div className="notice">
          Store setup: the shop owner must confirm delivery areas, timelines, a
          contact channel, and the final return window before accepting live
          orders.
        </div>
        <Link href="/info/contact">Get in touch →</Link>
      </>
    ),
  },
  "size-guide": {
    title: "A perfectly little fit.",
    content: (
      <>
        <p>
          Every baby grows in their own lovely way. Use this guide as a starting
          point and check the product’s size options before ordering.
        </p>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Approx. height</th>
              <th>Approx. weight</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["0–3 months", "50–62 cm", "3–6 kg"],
              ["3–6 months", "62–68 cm", "6–8 kg"],
              ["6–12 months", "68–80 cm", "8–10 kg"],
              ["12–18 months", "80–86 cm", "10–12 kg"],
            ].map((r) => (
              <tr key={r[0]}>
                {r.map((c) => (
                  <td key={c}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Measurements are approximate and vary by brand. If your little one is
          between sizes, compare the garment measurements or contact the shop
          for help.
        </p>
      </>
    ),
  },
  care: {
    title: "Made for little moments.",
    content: (
      <>
        <h2>A little gentleness goes a long way.</h2>
        <p>
          Wash clothing and textiles before first use. Always follow the care
          label; gentle cycles and mild detergent help keep soft things lovely
          for longer.
        </p>
        <h2>Thoughtfully chosen</h2>
        <p>
          Read each product description for its materials, size options, and
          care details. Product-specific certification claims should be
          confirmed with the shop before purchase.
        </p>
        <h2>Everyday care</h2>
        <p>
          Inspect toys and feeding products before each use, follow manufacturer
          age guidance, and supervise your little one. Keep soft toys, pillows,
          and loose bedding out of an infant’s sleep space.
        </p>
      </>
    ),
  },
  contact: {
    title: "Here for your little questions.",
    content: (
      <>
        <p>
          Need help choosing a size, finding a gift, or checking on your order?
          We’d love to help.
        </p>
        <h2>Order help</h2>
        <p>
          Sign in to <Link href="/account">your account</Link> to view your
          orders and their current status. Please include your order number in
          any enquiry.
        </p>
        <h2>Contact details</h2>
        <FooterContacts />
        <FooterSocials />
        <p>Based in Kenya. All prices are shown in Kenyan shillings.</p>
      </>
    ),
  },
  privacy: {
    title: "Your privacy matters.",
    content: (
      <>
        <p>
          AJ Baby Shop uses your account and order information to operate the
          shop and fulfil orders. This includes your name, email address, phone
          number, delivery address, and purchase details.
        </p>
        <h2>Your information</h2>
        <p>
          When connected, accounts and shop records are stored with Supabase.
          Authorised administrators can access customer and order details for
          store operations. Passwords are handled by Supabase Auth.
        </p>
        <h2>On your device</h2>
        <p>
          Your shopping bag and wishlist are saved in your browser’s local
          storage. In demo mode, sample catalogue changes and demo orders are
          also saved locally. Avoid entering sensitive personal details in the
          demo.
        </p>
        <h2>Newsletter & third-party content</h2>
        <p>
          Newsletter signup stores your email address for shop updates. Product
          photos may load from Unsplash, and fonts from Google Fonts; these
          services receive technical request information when content loads.
        </p>
        <h2>Your choices</h2>
        <p>
          You can sign out and clear browser storage at any time. The owner must
          provide a working contact channel for account, data access, deletion,
          and newsletter removal requests before launch.
        </p>
      </>
    ),
  },
  terms: {
    title: "The little details.",
    content: (
      <>
        <h2>Shopping with us</h2>
        <p>
          Prices are in Kenyan shillings. Product availability is checked when
          an order is placed. A submitted order is pending until reviewed by the
          shop.
        </p>
        <h2>Payment & delivery</h2>
        <p>
          This store offers cash on delivery. No card or mobile money payment is
          collected through this site. Delivery costs and discounts are
          recorded in the final order total.
        </p>
        <h2>Product information</h2>
        <p>
          Images are illustrative and colours may vary between screens. Follow
          product labels, age recommendations, and care instructions. Sample
          products and stock shown in demo mode are for demonstration only.
        </p>
        <h2>Returns & privacy</h2>
        <p>
          Please read our{" "}
          <Link href="/info/delivery">delivery and returns information</Link>{" "}
          and <Link href="/info/privacy">privacy policy</Link> before ordering.
        </p>
        <div className="notice">
          The shop owner must review and complete these store policies with the
          business’s actual terms and contact details before launch.
        </div>
      </>
    ),
  },
};
export default async function Info({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return (
    <StoreShell>
      <article className="info-page wrap">
        <span className="eyebrow">THE AJ FAMILY</span>
        <h1>{page.title}</h1>
        {page.content}
      </article>
    </StoreShell>
  );
}

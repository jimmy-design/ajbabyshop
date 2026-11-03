import Link from "next/link";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Music2,
  Mail,
  Phone,
  MapPin,
  Clock,
  AtSign,
} from "lucide-react";
import { storeDetails } from "@/lib/store-details";

export function FooterSocials() {
  const links = [
    { name: "Instagram", href: storeDetails.instagram, Icon: Instagram },
    { name: "Threads", href: storeDetails.threads, Icon: AtSign },
    { name: "Facebook", href: storeDetails.facebook, Icon: Facebook },
    { name: "TikTok", href: storeDetails.tiktok, Icon: Music2 },
    {
      name: "WhatsApp",
      href: storeDetails.whatsapp
        ? `https://wa.me/${storeDetails.whatsapp.replace(/\D/g, "")}`
        : "",
      Icon: MessageCircle,
    },
  ].filter((link) => link.href);

  if (!links.length) return null;
  return (
    <div className="footer-socials" aria-label="Follow AJ Baby Shop">
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} (opens in a new tab)`}
          title={name}
        >
          <Icon size={20} />
          <span>{name}</span>
        </a>
      ))}
    </div>
  );
}

export function FooterContacts() {
  return (
    <div className="footer-contacts">
      <h4>Let’s keep in touch</h4>
      <address>
        {storeDetails.phone && (
          <a href={`tel:${storeDetails.phone.replace(/[^\d+]/g, "")}`}>
            <Phone size={18} />
            <span>{storeDetails.phone}</span>
          </a>
        )}
        {storeDetails.email && (
          <a href={`mailto:${storeDetails.email}`}>
            <Mail size={18} />
            <span>{storeDetails.email}</span>
          </a>
        )}
        {storeDetails.whatsapp && (
          <a
            href={`https://wa.me/${storeDetails.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            <span>Chat with us on WhatsApp</span>
          </a>
        )}
        {storeDetails.address && (
          <span>
            <MapPin size={18} />
            <span>{storeDetails.address}</span>
          </span>
        )}
        {storeDetails.openingHours && (
          <span>
            <Clock size={18} />
            <span>{storeDetails.openingHours}</span>
          </span>
        )}
      </address>
      {!storeDetails.email && !storeDetails.phone && !storeDetails.whatsapp && (
        <p>Contact details coming soon.</p>
      )}
      <Link href="/info/contact" className="footer-contact-help">
        Contact & order help <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

import type { Venue } from '../types';

const query = (v: Venue) => v.mapsQuery ?? `${v.name}, ${v.address}`;

export function googleMapsUrl(venue: Venue): string {
  if (venue.googleMapsUrl) return venue.googleMapsUrl;
  const q = venue.lat != null && venue.lng != null ? `${venue.lat},${venue.lng}` : query(venue);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function wazeUrl(venue: Venue): string {
  if (venue.wazeUrl) return venue.wazeUrl;
  if (venue.lat != null && venue.lng != null) return `https://waze.com/ul?ll=${venue.lat}%2C${venue.lng}&navigate=yes`;
  return `https://waze.com/ul?q=${encodeURIComponent(query(venue))}&navigate=yes`;
}

const digits = (phone: string) => phone.replace(/[^\d+]/g, '');

export function telUrl(phone: string): string {
  return `tel:${digits(phone)}`;
}

export function whatsappUrl(phone: string, text?: string): string {
  const n = digits(phone).replace(/^\+/, '');
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/**
 * ============================================================================
 *  ENGLISH TEXTS (address "/en/")
 * ============================================================================
 *  {product}, {n}, {price}… are filled automatically — keep them as they are.
 * ============================================================================
 */
import type { Translation } from './ar';

const en: Translation = {
  meta: { label: 'English', short: 'EN', dir: 'ltr', ogLocale: 'en_US' },

  /* ---------- Product texts ---------- */
  productName: 'STRADA Clogs',
  headline: 'All-day comfort, with style',
  subheadline: 'Suede-look clogs with a comfortable footbed, for every step',
  currencyLabel: 'MAD',
  benefits: [
    { title: 'All-day comfort', text: 'A comfortable footbed that molds to your foot.' },
    { title: 'Style that goes with everything', text: 'Soft suede-look finish, perfect with jeans or casual outfits.' },
    { title: 'Practical and durable', text: 'Easy-care material, sturdy sole and adjustable buckle.' },
    { title: 'Free delivery, cash on delivery', text: 'Anywhere in Morocco, you only pay when it arrives.' },
  ],
  faq: [
    { q: 'How long does delivery take?', a: 'Delivery takes 24 to 72 hours depending on your city.' },
    { q: 'How do I pay?', a: 'Cash on delivery: you only pay when you receive your clogs.' },
    { q: 'Can I change my size?', a: 'Yes, you can exchange your size within 7 days of delivery, as long as the clogs are unworn and in their original packaging. Contact us on WhatsApp and we’ll handle the rest. Delivery fees for the exchange are paid by the customer.' },
    { q: 'How do I choose my size?', a: 'Take your usual size. If you’re between two sizes, choose the larger one. Check the {{size guide}} to be sure.' },
  ],
  sizeGuideTip:
    'Stand on a sheet of paper against a wall, mark the tip of your longest toe and measure from the wall to the mark. Pick the closest size; if you are between two sizes, take the bigger one.',

  /* ---------- SEO / sharing ---------- */
  seoTitle: 'STRADA — Comfortable suede-look clogs | Cash on delivery',
  seoDescription:
    'STRADA suede-look clogs with a comfortable footbed. Free delivery and cash on delivery everywhere in Morocco.',

  /* ---------- Page texts ---------- */
  topBar: 'Free delivery + cash on delivery all over Morocco',
  orderNow: 'Order now',
  trust: ['Cash on delivery', 'Fast delivery', 'Size exchange'],
  chooseColor: 'Color',
  chooseSize: 'Size',
  sizeGuide: 'Size guide',
  oldPrice: 'Old price:',
  benefitsTitle: 'Why you’ll love them',
  galleryTitle: 'Photos',
  swipeHint: '← Swipe to see the photos →',
  reviewsTitle: 'Customer reviews',
  offerTitle: 'Special offer',
  offerHeadline: '{n} pairs for only',
  offerInstead: 'instead of {old} — save {saving}',
  offerMix: 'Mix colors and sizes as you like',
  offerCta: 'Get the offer',
  faqTitle: 'Frequently asked questions',
  finalTitle: 'Don’t miss the offer!',
  rights: 'All rights reserved',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  whatsappAria: 'Contact us on WhatsApp',
  whatsappMessage: 'Hello, I’m interested in this product. Is it available right now?',
  languageLabel: 'Language',
  productSummary: 'Product summary',
  close: 'Close',
  imageAlt: 'STRADA suede-look clog — color {color}',
  galleryAlt: 'STRADA suede-look clog — color {color} — photo {n}',
  galleryList: '{color} photos',

  /* ---------- Header / footer ---------- */
  home: 'Home',
  footer: {
    tagline: 'Comfortable clogs for every day. Free delivery and cash on delivery all over Morocco.',
    links: 'Links',
    contact: 'Contact',
    contactText: 'Got a question? Message us on WhatsApp.',
    backToTop: 'Back to top',
  },

  /* ---------- Size guide ---------- */
  sizeTable: { size: 'Size (EU)', length: 'Foot length (cm)', howTo: 'How to measure your foot' },

  /* ---------- Order form ---------- */
  form: {
    title: 'Complete your order',
    subtitle: 'Fill in the form and we’ll call you to confirm.',
    pair: 'Pair',
    remove: 'Remove',
    addPair: 'Add another pair',
    bundleHintOne: 'Add 1 more pair and get the offer price!',
    bundleHintMany: 'Add {n} more pairs and get the offer price!',
    name: 'Full name',
    namePlaceholder: 'e.g. Mohamed Alaoui',
    phone: 'Phone number',
    city: 'City',
    cityPlaceholder: 'Type or choose your city',
    cityOther: 'City name',
    address: 'Address',
    addressPlaceholder: 'District, street, number',
    note: 'Note',
    optional: '(optional)',
    notePlaceholder: 'Anything else?',
    pairsCount: 'Number of pairs',
    saving: 'You save',
    delivery: 'Delivery',
    free: 'Free',
    total: 'Total',
    submit: 'Confirm order — cash on delivery',
    sending: 'Sending your order…',
    error: 'Something went wrong while sending. Try again or order directly on WhatsApp.',
    whatsappOrder: 'Order on WhatsApp',
    secure: '🔒 You only pay when you receive it',
    waIntro: 'Hello, I would like to order this product:',
    waName: 'Name',
    waPhone: 'Phone',
    waCity: 'City',
    waAddress: 'Address',
    waTotal: 'Total',
  },

  /* ---------- Error messages ---------- */
  errors: {
    color: 'Choose a color',
    size: 'Choose a size',
    sizeUnavailable: 'This size is not available in this color',
    name: 'Enter your full name (at least 3 letters)',
    phoneRequired: 'Enter your phone number',
    phoneInvalid: 'Invalid phone number (e.g. 0612345678)',
    city: 'Choose your city',
    cityOther: 'Enter your city name',
    address: 'Enter your address',
    noteTooLong: 'The note is too long',
    minPairs: 'Add at least one pair',
    maxPairs: '{n} pairs maximum',
  },

  /* ---------- 404 page ---------- */
  notFound: { title: 'Page not found', text: 'The link may be wrong or the page was removed.', back: 'Back to home page' },

  /* ---------- Thank-you page ---------- */
  thanks: {
    title: 'Thank you! We received your order',
    text: 'We will call you shortly to confirm your order.',
    summary: 'Order summary',
    pairLine: 'Pair {n}: {color} — size {size}',
    name: 'Name',
    phone: 'Phone',
    city: 'City',
    address: 'Address',
    total: 'Total (cash on delivery)',
    contact: 'Contact us on WhatsApp',
    contactMessage: 'Hello, I just placed an order and would like to confirm it.',
    back: 'Back to home page',
  },

  /* ---------- Cities ---------- */
  otherCity: 'Other city',
  cities: [
    'Casablanca', 'Rabat', 'Marrakech', 'Fez', 'Tangier', 'Agadir', 'Meknes', 'Oujda',
    'Kenitra', 'Tetouan', 'Sale', 'Temara', 'Mohammedia', 'El Jadida', 'Safi', 'Beni Mellal',
    'Khouribga', 'Nador', 'Settat', 'Berrechid', 'Larache', 'Ksar El Kebir', 'Khenifra',
    'Taza', 'Al Hoceima', 'Ouarzazate', 'Errachidia', 'Inezgane', 'Ait Melloul', 'Essaouira',
    'Taroudant', 'Tiznit', 'Guelmim', 'Laayoune', 'Dakhla', 'Ifrane', 'Fquih Ben Salah',
    'Sidi Kacem', 'Sidi Slimane', 'Ouezzane', 'Khemisset', 'Berkane', 'Taourirt', 'Skhirat',
    'Bouznika', 'Youssoufia', 'Kelaat Sraghna', 'Chefchaouen', 'Mdiq', 'Fnideq',
  ],
};

export default en;

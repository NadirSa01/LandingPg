/**
 * ============================================================================
 *  FRENCH TEXTS (address "/fr/")
 * ============================================================================
 *  {product}, {n}, {price}… are filled automatically — keep them as they are.
 * ============================================================================
 */
import type { Translation } from './ar';

const fr: Translation = {
  meta: { label: 'Français', short: 'FR', dir: 'ltr', ogLocale: 'fr_MA' },

  /* ---------- Product texts ---------- */
  productName: 'STRADA Clogs',
  headline: 'Le confort toute la journée, avec style',
  subheadline: 'Sabot effet daim avec semelle confortable, pour chaque pas',
  currencyLabel: 'DH',
  benefits: [
    { title: 'Confort toute la journée', text: 'Une semelle confortable qui épouse la forme de votre pied.' },
    { title: 'Un style qui va avec tout', text: 'Toucher effet daim doux, parfait avec un jean ou une tenue casual.' },
    { title: 'Pratique et résistant', text: 'Matière facile à entretenir, semelle robuste et boucle ajustable.' },
    { title: 'Livraison gratuite, paiement à la réception', text: 'Partout au Maroc, vous payez seulement à la réception.' },
  ],
  faq: [
    { q: 'Quel est le délai de livraison ?', a: 'La livraison prend entre 24 et 72 heures selon votre ville.' },
    { q: 'Comment payer ?', a: 'Paiement à la réception : vous payez seulement quand vous recevez vos sabots.' },
    { q: 'Puis-je changer de pointure ?', a: 'Oui, vous pouvez échanger la pointure sous 7 jours après la livraison, à condition que les sabots n’aient pas été portés et soient dans leur emballage d’origine. Contactez-nous sur WhatsApp et on s’occupe du reste. Les frais de livraison de l’échange sont à la charge du client.' },
    { q: 'Comment choisir ma pointure ?', a: 'Prenez votre pointure habituelle. Si vous êtes entre deux tailles, choisissez la plus grande. Consultez le {{guide des tailles}} pour être sûr.' },
  ],
  sizeGuideTip:
    "Posez votre pied sur une feuille contre un mur, marquez le bout de l'orteil le plus long et mesurez du mur jusqu'à la marque. Choisissez la pointure la plus proche ; entre deux pointures, prenez la plus grande.",

  /* ---------- SEO / sharing ---------- */
  seoTitle: 'STRADA — Sabot confortable effet daim | Paiement à la réception',
  seoDescription:
    'Sabots STRADA effet daim, semelle confortable. Livraison gratuite et paiement à la réception partout au Maroc.',

  /* ---------- Page texts ---------- */
  topBar: 'Livraison gratuite + paiement à la livraison partout au Maroc',
  orderNow: 'Commander',
  trust: ['Paiement à la livraison', 'Livraison rapide', 'Échange de pointure'],
  chooseColor: 'Couleur',
  chooseSize: 'Pointure',
  sizeGuide: 'Guide des pointures',
  oldPrice: 'Ancien prix :',
  benefitsTitle: 'Pourquoi vous allez l’adorer ?',
  galleryTitle: 'Photos',
  swipeHint: '← Glissez pour voir les photos →',
  reviewsTitle: 'Avis clients',
  offerTitle: 'Offre spéciale',
  offerHeadline: '{n} paires pour seulement',
  offerInstead: 'au lieu de {old} — économisez {saving}',
  offerMix: 'Couleurs et pointures au choix',
  offerCta: 'Profiter de l’offre',
  faqTitle: 'Questions fréquentes',
  finalTitle: 'Ne ratez pas l’offre !',
  rights: 'Tous droits réservés',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  whatsappAria: 'Nous contacter sur WhatsApp',
  whatsappMessage: 'Bonjour, ce produit m’intéresse. Est-il disponible en ce moment ?',
  languageLabel: 'Langue',
  productSummary: 'Résumé du produit',
  close: 'Fermer',
  imageAlt: 'Sabot STRADA effet daim — couleur {color}',
  galleryAlt: 'Sabot STRADA effet daim — couleur {color} — photo {n}',
  galleryList: 'Photos couleur {color}',

  /* ---------- Header / footer ---------- */
  home: 'Accueil',
  footer: {
    tagline: 'Des sabots confortables pour tous les jours. Livraison gratuite et paiement à la livraison partout au Maroc.',
    links: 'Liens',
    contact: 'Contact',
    contactText: 'Une question ? Écrivez-nous sur WhatsApp.',
    backToTop: 'Haut de page',
  },

  /* ---------- Size guide ---------- */
  sizeTable: { size: 'Pointure (EU)', length: 'Longueur du pied (cm)', howTo: 'Comment mesurer votre pied ?' },

  /* ---------- Order form ---------- */
  form: {
    title: 'Finalisez votre commande',
    subtitle: 'Remplissez le formulaire, nous vous appelons pour confirmer.',
    pair: 'Paire',
    remove: 'Retirer',
    addPair: 'Ajouter une paire',
    bundleHintOne: 'Ajoutez 1 paire et profitez du prix de l’offre !',
    bundleHintMany: 'Ajoutez {n} paires et profitez du prix de l’offre !',
    name: 'Nom complet',
    namePlaceholder: 'Ex : Mohamed Alaoui',
    phone: 'Téléphone',
    city: 'Ville',
    cityPlaceholder: 'Tapez ou choisissez votre ville',
    cityOther: 'Nom de la ville',
    address: 'Adresse',
    addressPlaceholder: 'Quartier, rue, numéro',
    note: 'Remarque',
    optional: '(facultatif)',
    notePlaceholder: 'Une précision ?',
    pairsCount: 'Nombre de paires',
    saving: 'Économie',
    delivery: 'Livraison',
    free: 'Gratuite',
    total: 'Total',
    submit: 'Confirmer — paiement à la livraison',
    sending: 'Envoi en cours…',
    error: 'Un problème est survenu lors de l’envoi. Réessayez ou commandez directement sur WhatsApp.',
    whatsappOrder: 'Commander sur WhatsApp',
    secure: '🔒 Vous payez seulement à la réception',
    waIntro: 'Bonjour, je souhaite commander ce produit :',
    waName: 'Nom',
    waPhone: 'Téléphone',
    waCity: 'Ville',
    waAddress: 'Adresse',
    waTotal: 'Total',
  },

  /* ---------- Error messages ---------- */
  errors: {
    color: 'Choisissez une couleur',
    size: 'Choisissez une pointure',
    sizeUnavailable: 'Pointure indisponible dans cette couleur',
    name: 'Entrez votre nom complet (3 lettres minimum)',
    phoneRequired: 'Entrez votre numéro de téléphone',
    phoneInvalid: 'Numéro invalide (ex : 0612345678)',
    city: 'Choisissez votre ville',
    cityOther: 'Entrez le nom de votre ville',
    address: 'Entrez votre adresse',
    noteTooLong: 'La remarque est trop longue',
    minPairs: 'Ajoutez au moins une paire',
    maxPairs: '{n} paires maximum',
  },

  /* ---------- 404 page ---------- */
  notFound: { title: 'Page introuvable', text: 'Le lien est peut-être erroné ou la page a été supprimée.', back: 'Retour à l’accueil' },

  /* ---------- Thank-you page ---------- */
  thanks: {
    title: 'Merci ! Votre commande est bien reçue',
    text: 'Nous vous appellerons très vite pour confirmer votre commande.',
    summary: 'Récapitulatif',
    pairLine: 'Paire {n} : {color} — pointure {size}',
    name: 'Nom',
    phone: 'Téléphone',
    city: 'Ville',
    address: 'Adresse',
    total: 'Total (paiement à la livraison)',
    contact: 'Nous contacter sur WhatsApp',
    contactMessage: 'Bonjour, je viens de passer commande et je souhaite la confirmer.',
    back: 'Retour à l’accueil',
  },

  /* ---------- Cities ---------- */
  otherCity: 'Autre ville',
  cities: [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda',
    'Kénitra', 'Tétouan', 'Salé', 'Témara', 'Mohammedia', 'El Jadida', 'Safi', 'Béni Mellal',
    'Khouribga', 'Nador', 'Settat', 'Berrechid', 'Larache', 'Ksar El Kébir', 'Khénifra',
    'Taza', 'Al Hoceïma', 'Ouarzazate', 'Errachidia', 'Inezgane', 'Aït Melloul', 'Essaouira',
    'Taroudant', 'Tiznit', 'Guelmim', 'Laâyoune', 'Dakhla', 'Ifrane', 'Fquih Ben Salah',
    'Sidi Kacem', 'Sidi Slimane', 'Ouezzane', 'Khémisset', 'Berkane', 'Taourirt', 'Skhirat',
    'Bouznika', 'Youssoufia', 'Kelâa des Sraghna', 'Chefchaouen', 'M’diq', 'Fnideq',
  ],
};

export default fr;

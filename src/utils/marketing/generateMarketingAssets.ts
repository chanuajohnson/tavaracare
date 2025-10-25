import { supabase } from '@/integrations/supabase/client';

export const generateErrandsPricingSheet = async () => {
  const prompt = `
    Create a professional marketing one-sheet for "Tavara.care Errands Service" with this exact content:
    
    HEADER: "Tavara.care Errands" in large bold text with blue gradient (#6B9FDB to lighter blue)
    TAGLINE: "We run errands so you don't have to" in clean sans-serif font
    
    PRICING SECTION (center, bold, large text):
    - "TT$50 Base Fee" in a prominent blue box (#6B9FDB background, white text)
    - Local Errands: TT$50 (groceries, pharmacy, quick stops)
    - City Errands: TT$100 (Port of Spain, San Fernando, banking)
    - Big Hauls: TT$150+ (furniture, appliances, bulk shopping)
    
    SERVICES GRID (4x2 layout with icons and labels):
    🛒 Grocery Shopping | 💊 Pharmacy Runs
    🏦 Banking Errands | 📦 Package Pickup
    🏪 Store Purchases | 🍽️ Food Delivery
    🚗 Transportation | 📮 Mail & Shipping
    
    BOOKING INFO (bottom section, clear and readable):
    📱 WhatsApp: +1 (868) 712-7677
    💳 PayPal: 50% deposit required upfront
    🌐 Book online: tavara.care/errands
    
    FOOTER: "Scan QR Code to Book" with a placeholder box for QR code
    
    Design style: 
    - Clean, modern, professional with plenty of white space
    - Use Tavara blue (#6B9FDB) as primary accent color
    - High contrast black text on white background for easy printing
    - Portrait orientation (8.5x11" standard)
    - Professional typography with clear hierarchy
    - Print-ready quality at 300dpi
  `;

  const { data, error } = await supabase.functions.invoke('generate-marketing-image', {
    body: { prompt, width: 1024, height: 1536, outputFormat: 'png' }
  });

  if (error) throw error;
  return data?.imageUrl;
};

export const generateInstagramTemplates = async () => {
  const templates = [
    {
      name: 'ig-pricing-hero',
      prompt: `Instagram post 1080x1080: Tavara.care Errands Pricing Hero Post. 
        Large bold "TT$50 BASE FEE" text in center with blue gradient background (#6B9FDB). 
        Below: "Local Errands from TT$50 | City Errands TT$100 | Big Hauls TT$150+"
        Bottom: WhatsApp icon with "+1 (868) 712-7677" in white text.
        Clean, modern design with high readability. Tavara.care logo subtle in corner.`
    },
    {
      name: 'ig-services-grid',
      prompt: `Instagram post 1080x1080: Service icon grid for Tavara.care Errands.
        3x3 grid layout with rounded white squares on light blue background.
        Each square contains an icon and service name:
        - Grocery Shopping (🛒)
        - Pharmacy Runs (💊)
        - Banking Errands (🏦)
        - Package Pickup (📦)
        - Store Purchases (🏪)
        - Food Delivery (🍽️)
        - Transportation (🚗)
        - Mail & Shipping (📮)
        - Custom Errands (✨)
        Header text: "We Handle It All" in bold.
        Tavara blue (#6B9FDB) accents. Professional and clean.`
    },
    {
      name: 'ig-monthly-plan',
      prompt: `Instagram post 1080x1080: Monthly subscription promotion for Tavara.care Errands.
        Large headline: "Monthly Errands Plan"
        Prominent pricing: "4 Errands for TT$180" with "Save TT$20!" badge
        Benefits listed with blue checkmarks:
        ✓ Priority booking
        ✓ No rush fees
        ✓ Flexible scheduling
        ✓ Dedicated support
        Bottom CTA: "DM to Subscribe" button in Tavara blue.
        Blue gradient background (#6B9FDB). Professional design.`
    },
    {
      name: 'ig-trinidad-coverage',
      prompt: `Instagram post 1080x1080: Trinidad & Tobago coverage map for Tavara.care.
        Center: Simplified silhouette of Trinidad & Tobago islands in Tavara blue (#6B9FDB).
        Pin markers on major cities: Port of Spain, San Fernando, Chaguanas, Arima.
        Bold headline: "Serving All of Trinidad & Tobago"
        Subtext: "Island-wide errands service you can trust"
        Bottom: "Book Now" button with WhatsApp icon.
        Clean white background, professional design.`
    },
    {
      name: 'ig-testimonial',
      prompt: `Instagram post 1080x1080: Customer testimonial template for Tavara.care.
        Top: 5 gold stars (⭐⭐⭐⭐⭐) rating display
        Large quotation marks in Tavara blue (#6B9FDB)
        Center: Space for testimonial text (placeholder: elegant quote marks)
        Bottom: Space for customer name and location
        Clean white background with subtle blue accent border.
        Professional, trustworthy design. Leave space for actual testimonial text.`
    },
    {
      name: 'ig-cta-book-now',
      prompt: `Instagram post 1080x1080: Call-to-action booking post for Tavara.care Errands.
        Bold headline: "Need Errands Done?"
        Subheading: "Book in 2 Minutes"
        3 simple steps with numbered icons:
        1️⃣ Message us on WhatsApp
        2️⃣ Tell us what you need
        3️⃣ We handle the rest
        Large WhatsApp icon with "+1 (868) 712-7677"
        Small QR code in bottom corner
        Blue gradient background (#6B9FDB to lighter blue).
        Professional, actionable design.`
    }
  ];

  const generated = [];
  for (const template of templates) {
    const { data, error } = await supabase.functions.invoke('generate-marketing-image', {
      body: { prompt: template.prompt, width: 1080, height: 1080, outputFormat: 'png' }
    });
    
    if (error) {
      console.error(`Failed to generate ${template.name}:`, error);
      continue;
    }
    
    generated.push({ name: template.name, imageUrl: data?.imageUrl });
  }

  return generated;
};

export const generateErrandsQRCodes = async () => {
  const qr1Prompt = `
    Create a high-resolution QR code image with professional styling:
    
    CENTER: Large, scannable QR code that links to: https://tavara.care/errands?source=marketing_qr_print
    BELOW QR CODE: "Scan to View Errands Services" in bold blue text (#6B9FDB)
    BORDER: 10px blue border (#6B9FDB) with rounded corners
    BACKGROUND: Clean white
    BOTTOM: Small "tavara.care" text in gray
    
    The QR code should be large (70% of image) and easily scannable.
    Professional, print-ready design at 300dpi.
    Square format with padding for printing.
  `;

  const qr2Prompt = `
    Create a high-resolution QR code image with professional styling:
    
    CENTER: Large, scannable QR code that links to: https://wa.me/18687127677?text=Hi!%20I'd%20like%20to%20book%20an%20errands%20service
    BELOW QR CODE: "Scan to Book via WhatsApp" in bold blue text (#6B9FDB)
    WhatsApp icon (green) integrated near QR code
    BORDER: 10px blue border (#6B9FDB) with rounded corners
    BACKGROUND: Clean white
    BOTTOM: Small "tavara.care" text in gray
    
    The QR code should be large (70% of image) and easily scannable.
    Professional, print-ready design at 300dpi.
    Square format with padding for printing.
  `;

  const { data: qr1Data } = await supabase.functions.invoke('generate-marketing-image', {
    body: { prompt: qr1Prompt, width: 1024, height: 1024, outputFormat: 'png' }
  });

  const { data: qr2Data } = await supabase.functions.invoke('generate-marketing-image', {
    body: { prompt: qr2Prompt, width: 1024, height: 1024, outputFormat: 'png' }
  });

  return { qr1: qr1Data?.imageUrl, qr2: qr2Data?.imageUrl };
};

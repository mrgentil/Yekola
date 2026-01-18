import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Default settings
const defaultSettings = {
    // Site Identity
    siteName: {
        value: 'LearnHub',
        description: "Nom du site"
    },
    siteTagline: {
        value: 'Votre parcours d\'apprentissage',
        description: "Slogan du site"
    },
    siteLogo: {
        value: '',
        description: "URL du logo"
    },
    siteFavicon: {
        value: '',
        description: "URL du favicon"
    },
    
    // Contact Info
    supportEmail: {
        value: 'support@learnhub.com',
        description: "Email de support"
    },
    supportPhone: {
        value: '+243 XXX XXX XXX',
        description: "Téléphone de support"
    },
    address: {
        value: 'Kinshasa, RDC',
        description: "Adresse"
    },
    
    // Social Links
    socialFacebook: {
        value: '',
        description: "Lien Facebook"
    },
    socialTwitter: {
        value: '',
        description: "Lien Twitter"
    },
    socialLinkedin: {
        value: '',
        description: "Lien LinkedIn"
    },
    socialYoutube: {
        value: '',
        description: "Lien YouTube"
    },
    socialWhatsapp: {
        value: '',
        description: "Numéro WhatsApp"
    },
    
    // Hero Slides
    heroSlides: {
        value: [
            {
                title: "Construisez votre avenir avec des cours conçus pour vous",
                subtitle: "Nous réunissons des instructeurs de classe mondiale, du contenu interactif et une communauté solidaire pour vous aider à atteindre vos objectifs.",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
                buttonText: "Explorer les cours",
                buttonLink: "/course-list"
            },
            {
                title: "Apprenez des experts et boostez votre carrière",
                subtitle: "Accédez à des milliers de cours dispensés par des professionnels. Obtenez une certification et démarquez-vous sur le marché du travail.",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80",
                buttonText: "Commencer maintenant",
                buttonLink: "/course-list"
            },
            {
                title: "Étudiez à votre rythme avec un apprentissage flexible",
                subtitle: "Apprenez n'importe quand, n'importe où. Notre plateforme vous permet d'étudier en déplacement et de suivre vos progrès.",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80",
                buttonText: "Découvrir",
                buttonLink: "/course-list"
            }
        ],
        description: "Slides du carrousel hero"
    },
    
    // Homepage Sections
    showCompanies: {
        value: true,
        description: "Afficher la section entreprises"
    },
    showTrending: {
        value: true,
        description: "Afficher les cours tendances"
    },
    showTestimonials: {
        value: true,
        description: "Afficher les témoignages"
    },
    
    // Payment Settings
    platformCommission: {
        value: 20,
        description: "Commission de la plateforme en pourcentage (%)"
    },
    educatorShare: {
        value: 80,
        description: "Part de l'éducateur en pourcentage (%)"
    },
    minPayout: {
        value: 50,
        description: "Montant minimum pour demander un retrait ($)"
    },
    currency: {
        value: 'USD',
        description: "Devise principale de la plateforme"
    },
    
    // Mobile Money Numbers
    mpesaNumber: {
        value: '+243 XXX XXX XXX',
        description: "Numéro M-Pesa"
    },
    orangeMoneyNumber: {
        value: '+243 XXX XXX XXX',
        description: "Numéro Orange Money"
    },
    airtelMoneyNumber: {
        value: '+243 XXX XXX XXX',
        description: "Numéro Airtel Money"
    },
    
    // Footer
    footerAbout: {
        value: "LearnHub LMS révolutionne l'éducation en la rendant accessible et engageante.",
        description: "Texte À propos dans le footer"
    },
    copyrightText: {
        value: "© 2025 LearnHub. Tous droits réservés.",
        description: "Texte de copyright"
    }
};

// Static method to get a setting
settingsSchema.statics.getSetting = async function(key) {
    const setting = await this.findOne({ key });
    if (setting) return setting.value;
    
    // Return default if exists
    if (defaultSettings[key]) return defaultSettings[key].value;
    return null;
};

// Static method to set a setting
settingsSchema.statics.setSetting = async function(key, value, userId) {
    return await this.findOneAndUpdate(
        { key },
        { 
            key, 
            value, 
            description: defaultSettings[key]?.description || '',
            updatedBy: userId 
        },
        { upsert: true, new: true }
    );
};

// Static method to get all settings
settingsSchema.statics.getAllSettings = async function() {
    const settings = await this.find({});
    const result = {};
    
    // Start with defaults
    for (const [key, data] of Object.entries(defaultSettings)) {
        result[key] = { value: data.value, description: data.description };
    }
    
    // Override with saved settings
    for (const setting of settings) {
        result[setting.key] = { 
            value: setting.value, 
            description: setting.description,
            updatedAt: setting.updatedAt
        };
    }
    
    return result;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;

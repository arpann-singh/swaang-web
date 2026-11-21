export type JoinFieldType =
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'date'
    | 'select'
    | 'wing_cards'
    | 'radio'
    | 'checkbox_group'
    | 'boolean'
    | 'image_upload'
    | 'url'
    | 'rating'
    | 'availability_grid'
    | 'slot_picker'
    | 'monologue_picker'
    | 'section_header'
    | 'consent';

export type CoreFieldMapping =
    | 'none'
    | 'name'
    | 'email'
    | 'phone'
    | 'branch'
    | 'year'
    | 'role'
    | 'experience'
    | 'portfolio'
    | 'photoLink';

export interface WingCategory {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    color: 'crimson' | 'gold' | 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';
    quota?: string;
    isActive: boolean;
}

export interface JoinFormField {
    id: string;
    type: JoinFieldType;
    label: string;
    placeholder?: string;
    helpText?: string;
    required: boolean;
    width: 'full' | 'half' | 'third';
    options?: string[];
    maxRating?: 5 | 10;
    conditionalWings?: string[]; // empty array = visible for all wings
    mapToCore?: CoreFieldMapping;
    defaultValue?: string;
}

export interface JoinFormDefinition {
    id: string;
    slug: string;
    title: string;
    badge: string;
    subtitle: string;
    description: string;
    isLive: boolean;
    isFeaturedOnJoinUs: boolean;
    ctaText: string;
    submitButtonText: string;
    opensAt?: string;
    closesAt?: string;
    maxSubmissions?: number;
    closedTitle: string;
    closedMessage: string;
    successTitle: string;
    successMessage: string;
    whatsappGroupUrl?: string;
    showResourcesLink: boolean;
    multiStep: boolean;
    fields: JoinFormField[];
    createdAt: string;
    updatedAt: string;
}

export interface JoinFormsGlobalConfig {
    masterLive: boolean;
    heroCtaText: string;
    hubMode: 'single' | 'hub'; // 'single' opens primary form directly; 'hub' shows selector when 2+ forms are live
    primaryFormId: string;
    closedDoorTitle: string;
    closedDoorMessage: string;
    wings: WingCategory[];
    forms: JoinFormDefinition[];
}

export const FIELD_TYPE_CATALOG: {
    type: JoinFieldType;
    label: string;
    category: 'Standard Inputs' | 'Choice & Categories' | 'Theatre & Creative Widgets';
    description: string;
    hasOptions?: boolean;
}[] = [
    // Standard Inputs
    {
        type: 'text',
        label: 'Short Text',
        category: 'Standard Inputs',
        description: 'Single-line text for Name, Roll No., Instrument, or Software.'
    },
    {
        type: 'textarea',
        label: 'Long Paragraph',
        category: 'Standard Inputs',
        description: 'Multi-line essay for Theatrical Background, Motivation, or Story Pitch.'
    },
    {
        type: 'email',
        label: 'Email Address',
        category: 'Standard Inputs',
        description: 'Validated email input for official call-sheet notifications.'
    },
    {
        type: 'phone',
        label: 'WhatsApp / Phone',
        category: 'Standard Inputs',
        description: '10-digit WhatsApp phone number for instant audition coordination.'
    },
    {
        type: 'number',
        label: 'Number / Metric',
        category: 'Standard Inputs',
        description: 'Numeric input for Age, Years of Experience, or Past Productions Count.'
    },
    {
        type: 'date',
        label: 'Date Picker',
        category: 'Standard Inputs',
        description: 'Calendar date selection for Date of Birth or Preferred Audition Date.'
    },

    // Choice & Categories
    {
        type: 'wing_cards',
        label: 'Wing / Department Cards',
        category: 'Choice & Categories',
        description: 'Interactive visual cards powered by your Wings & Categories list. Triggers conditional questions!'
    },
    {
        type: 'select',
        label: 'Dropdown Select',
        category: 'Choice & Categories',
        description: 'Clean dropdown menu for Academic Year, Branch, Hostel/Day Scholar, etc.',
        hasOptions: true
    },
    {
        type: 'radio',
        label: 'Single Choice (Radio Pills)',
        category: 'Choice & Categories',
        description: 'Tactile pill buttons for picking one option (e.g., Language Preference, Shirt Size).',
        hasOptions: true
    },
    {
        type: 'checkbox_group',
        label: 'Multi-Select Checkboxes',
        category: 'Choice & Categories',
        description: 'Select multiple skills, dialects, instruments, or secondary departments.',
        hasOptions: true
    },
    {
        type: 'boolean',
        label: 'Yes / No Toggle',
        category: 'Choice & Categories',
        description: 'Quick binary commitment check (e.g., "Can you stay back for late evening rehearsals?").'
    },

    // Theatre & Creative Widgets
    {
        type: 'image_upload',
        label: 'Direct Photo / Headshot Upload',
        category: 'Theatre & Creative Widgets',
        description: 'One-click ImgBB cloud photo upload with instant preview + direct link fallback.'
    },
    {
        type: 'url',
        label: 'Portfolio / Audition Reel URL',
        category: 'Theatre & Creative Widgets',
        description: 'Link input for Google Drive, YouTube, Instagram Reel, Behance, or GitHub.'
    },
    {
        type: 'rating',
        label: 'Skill Self-Rating Scale',
        category: 'Theatre & Creative Widgets',
        description: 'Interactive 1–5 or 1–10 rating bar for Voice Projection, Improv, Stage Presence, etc.'
    },
    {
        type: 'availability_grid',
        label: 'Weekly Rehearsal Availability Grid',
        category: 'Theatre & Creative Widgets',
        description: 'Interactive Mon–Sat × Evening slot matrix for rehearsal conflict mapping.'
    },
    {
        type: 'slot_picker',
        label: 'Audition Venue & Time Slot Picker',
        category: 'Theatre & Creative Widgets',
        description: 'Let applicants reserve a specific audition day, room, and time window.',
        hasOptions: true
    },
    {
        type: 'monologue_picker',
        label: 'Official Monologue / Script Picker',
        category: 'Theatre & Creative Widgets',
        description: 'Pulls live monologue scripts from your Audition Prep Vault for actors to select.'
    },
    {
        type: 'section_header',
        label: 'Dramatic Act / Section Divider',
        category: 'Theatre & Creative Widgets',
        description: 'Visual chapter heading & instructions block to organize long forms (splits pages in Multi-Step mode).'
    },
    {
        type: 'consent',
        label: 'Discipline & Code of Conduct Pledge',
        category: 'Theatre & Creative Widgets',
        description: 'Mandatory society discipline and rehearsal attendance agreement checkbox.'
    }
];

export const DEFAULT_WINGS: WingCategory[] = [
    {
        id: 'acting',
        name: 'Stage Acting',
        tagline: 'Proscenium, Mono-Act & Character Craft',
        description: 'Command the spotlight through method acting, emotional depth, physical theatre, and dialogue delivery.',
        icon: 'Theater',
        color: 'crimson',
        quota: '12–15 Seats',
        isActive: true
    },
    {
        id: 'nukkad',
        name: 'Nukkad Natak',
        tagline: 'Street Theatre, Chorus & Djembe Energy',
        description: 'High-voltage open-air street performances, vocal projection, synchronised formations, and social impact.',
        icon: 'Megaphone',
        color: 'gold',
        quota: '15–20 Seats',
        isActive: true
    },
    {
        id: 'direction_writing',
        name: 'Direction & Scriptwriting',
        tagline: 'Playwrights, Dramaturgy & Stage Blocking',
        description: 'Architect original scripts, adapt literary classics, and direct ensemble blocking and character arcs.',
        icon: 'Feather',
        color: 'violet',
        quota: '4–6 Seats',
        isActive: true
    },
    {
        id: 'music',
        name: 'Music & Live Sound',
        tagline: 'Live Accompaniment, Vocals & Foley',
        description: 'Compose original theatrical scores, play live acoustic/percussion instruments, and engineer stage cues.',
        icon: 'Music',
        color: 'emerald',
        quota: '5–8 Seats',
        isActive: true
    },
    {
        id: 'decor',
        name: 'Stage Decor, Props & Costumes',
        tagline: 'Scenography, Set Building & Make-Up',
        description: 'Transform empty stages into immersive worlds through set architecture, hand-crafted props, and period styling.',
        icon: 'Palette',
        color: 'amber',
        quota: '6–10 Seats',
        isActive: true
    },
    {
        id: 'pr_media',
        name: 'PR, Cinematography & Design',
        tagline: 'Posters, Trailers, Photography & Outreach',
        description: 'Shape Swaang’s visual identity, shoot cinematic showreels, design posters, and lead festival sponsorships.',
        icon: 'Camera',
        color: 'rose',
        quota: '6–8 Seats',
        isActive: true
    },
    {
        id: 'tech',
        name: 'Lights, Tech & Digital Ops',
        tagline: 'Stage Lighting Design, Console & Web',
        description: 'Design dramatic spotlight cues, operate DMX light boards, and build digital interactive experiences.',
        icon: 'Sparkles',
        color: 'sky',
        quota: '4–6 Seats',
        isActive: true
    }
];

export const FORM_TEMPLATES: JoinFormDefinition[] = [
    {
        id: 'swaang-annual-auditions',
        slug: 'annual-auditions',
        title: 'Annual Recruitment & Mainstage Auditions',
        badge: 'ANNUAL RECRUITMENT DRIVE',
        subtitle: 'Step Into The Spotlight',
        description: 'Official intake form for actors, street performers, writers, musicians, designers, and backstage architects of Swaang — The Dramatics Society.',
        isLive: true,
        isFeaturedOnJoinUs: true,
        ctaText: 'JOIN US',
        submitButtonText: 'Submit Official Application',
        opensAt: '',
        closesAt: '',
        maxSubmissions: 0,
        closedTitle: 'The Curtain Is Currently Drawn',
        closedMessage: 'Auditions and recruitment for this cycle have concluded. Follow our official notices for the next call-sheet.',
        successTitle: 'Application Sealed & Indexed',
        successMessage: 'Your dossier has been logged at the Casting Desk. Keep your ticket code safe and prepare using the Audition Prep Vault.',
        whatsappGroupUrl: '',
        showResourcesLink: true,
        multiStep: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        fields: [
            {
                id: 'sec_identity',
                type: 'section_header',
                label: 'Act I — Personal & Academic Identity',
                helpText: 'Tell the Casting Desk who you are and how we can reach you for call-sheets.',
                required: false,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'f_name',
                type: 'text',
                label: 'Full Name',
                placeholder: 'e.g. Aarav Sharma',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'name'
            },
            {
                id: 'f_email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'aarav@example.com',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'email'
            },
            {
                id: 'f_phone',
                type: 'phone',
                label: 'WhatsApp Number',
                placeholder: '9876543210',
                helpText: '10-digit active WhatsApp number for audition slot alerts.',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'phone'
            },
            {
                id: 'f_branch',
                type: 'text',
                label: 'Branch / Department',
                placeholder: 'e.g. CSE / ECE / IT / MAE',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'branch'
            },
            {
                id: 'f_year',
                type: 'select',
                label: 'Academic Year',
                required: true,
                width: 'third',
                options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                conditionalWings: [],
                mapToCore: 'year'
            },
            {
                id: 'sec_wing',
                type: 'section_header',
                label: 'Act II — Choose Your Wing & Craft',
                helpText: 'Select your primary wing below. Specialized questions for your chosen craft will unlock automatically.',
                required: false,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'f_wing',
                type: 'wing_cards',
                label: 'Primary Society Wing / Category',
                helpText: 'Click a card to select your primary department for Round 1.',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'role'
            },
            {
                id: 'f_secondary_wings',
                type: 'checkbox_group',
                label: 'Secondary Interests (Optional)',
                helpText: 'Check any additional departments you would love to contribute to.',
                required: false,
                width: 'full',
                options: [
                    'Stage Acting',
                    'Nukkad Natak',
                    'Direction & Scriptwriting',
                    'Music & Live Sound',
                    'Stage Decor & Props',
                    'PR, Cinematography & Design',
                    'Lights & Tech'
                ],
                conditionalWings: [],
                mapToCore: 'none'
            },
            // Wing-specific conditional questions!
            {
                id: 'f_acting_monologue',
                type: 'monologue_picker',
                label: 'Chosen Audition Monologue / Piece',
                helpText: 'Select an official script from the Prep Vault or choose "Own Prepared Piece".',
                required: false,
                width: 'half',
                conditionalWings: ['acting', 'nukkad'],
                mapToCore: 'none'
            },
            {
                id: 'f_vocal_projection',
                type: 'rating',
                label: 'Self-Rating: Voice Projection & Stage Presence',
                helpText: '1 = Beginner exploring the stage, 10 = Commanded open-air or auditorium crowds.',
                required: false,
                width: 'half',
                maxRating: 10,
                conditionalWings: ['acting', 'nukkad'],
                mapToCore: 'none'
            },
            {
                id: 'f_writing_genre',
                type: 'radio',
                label: 'Preferred Dramatic Genre & Medium',
                required: false,
                width: 'full',
                options: [
                    'Satire & Social Commentary',
                    'Psychological Thriller / Tragedy',
                    'Absurdist / Experimental Theatre',
                    'Hindustani / Urdu Literary Adaptation',
                    'Comedy & Farce'
                ],
                conditionalWings: ['direction_writing'],
                mapToCore: 'none'
            },
            {
                id: 'f_music_instruments',
                type: 'text',
                label: 'Instruments / DAWs / Vocal Styles You Perform',
                placeholder: 'e.g. Djembe, Acoustic Guitar, Cajon, Harmonium, Classical Vocals, Logic Pro',
                required: false,
                width: 'full',
                conditionalWings: ['music'],
                mapToCore: 'none'
            },
            {
                id: 'f_creative_tools',
                type: 'checkbox_group',
                label: 'Design, Media or Technical Tools You Use',
                required: false,
                width: 'full',
                options: [
                    'Adobe Photoshop / Illustrator',
                    'Premiere Pro / DaVinci Resolve / After Effects',
                    'Figma / Canva / UI Design',
                    'DSLR Cinematography & Photography',
                    'Physical Set Craft / Painting / Carpentry',
                    'DMX Stage Lighting / Sound Console'
                ],
                conditionalWings: ['decor', 'pr_media', 'tech'],
                mapToCore: 'none'
            },
            {
                id: 'sec_dossier',
                type: 'section_header',
                label: 'Act III — Theatrical Dossier & Media',
                helpText: 'Share your journey, headshot, and any past work.',
                required: false,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'f_photo',
                type: 'image_upload',
                label: 'Headshot / Portrait Photograph',
                placeholder: 'Upload a clear portrait or paste an image link',
                helpText: 'Used on your digital audition card so the panel recognizes you during live rounds.',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'photoLink'
            },
            {
                id: 'f_portfolio',
                type: 'url',
                label: 'Audition Reel / Portfolio / Work Sample Link (Optional)',
                placeholder: 'https://drive.google.com/... or Instagram/YouTube/Behance link',
                helpText: 'Make sure link sharing access is set to "Anyone with the link".',
                required: false,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'portfolio'
            },
            {
                id: 'f_experience',
                type: 'textarea',
                label: 'Why Swaang? & Your Past Experience',
                placeholder: 'Tell us about any plays, street performances, school theatre, creative projects — or why you want to begin your stage journey with Swaang...',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'experience'
            },
            {
                id: 'f_slot',
                type: 'slot_picker',
                label: 'Preferred Audition Slot Window',
                helpText: 'Select the audition window that best fits your lecture schedule.',
                required: false,
                width: 'half',
                options: [
                    'Day 1 — Afternoon Block (1:30 PM – 3:30 PM)',
                    'Day 1 — Evening Block (3:30 PM – 5:30 PM)',
                    'Day 2 — Afternoon Block (1:30 PM – 3:30 PM)',
                    'Day 2 — Evening Block (3:30 PM – 5:30 PM)'
                ],
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'f_rehearsal_commit',
                type: 'boolean',
                label: 'Are you comfortable committing to evening rehearsals during festival season?',
                required: false,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'f_consent',
                type: 'consent',
                label: 'I pledge to uphold Swaang’s ensemble discipline, respect rehearsal call-times, and bring full honesty to the stage.',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'none'
            }
        ]
    },
    {
        id: 'nukkad-street-tryouts',
        slug: 'nukkad-tryouts',
        title: 'Nukkad Natak — Street Wing Open Tryouts',
        badge: 'STREET WING CALL-SHEET',
        subtitle: 'Awaaz Do! Command The Circle',
        description: 'Specialized call-sheet for Swaang’s annual street theatre production. High-energy physical theatre, chorus projection, djembe rhythm, and raw social commentary.',
        isLive: false,
        isFeaturedOnJoinUs: false,
        ctaText: 'JOIN NUKKAD',
        submitButtonText: 'Lock My Street Tryout Slot',
        opensAt: '',
        closesAt: '',
        maxSubmissions: 0,
        closedTitle: 'Nukkad Tryouts Concluded',
        closedMessage: 'The street circle is currently closed. Watch the noticeboard for open workshops.',
        successTitle: 'Awaaz Registered!',
        successMessage: 'Warm up your vocal cords and wear comfortable clothes for physical theatre exercises.',
        whatsappGroupUrl: '',
        showResourcesLink: true,
        multiStep: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        fields: [
            {
                id: 'nk_name',
                type: 'text',
                label: 'Full Name',
                placeholder: 'Your Full Name',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'name'
            },
            {
                id: 'nk_email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'you@example.com',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'email'
            },
            {
                id: 'nk_phone',
                type: 'phone',
                label: 'WhatsApp Number',
                placeholder: '9876543210',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'phone'
            },
            {
                id: 'nk_branch',
                type: 'text',
                label: 'Branch',
                placeholder: 'CSE / ECE / IT',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'branch'
            },
            {
                id: 'nk_year',
                type: 'select',
                label: 'Academic Year',
                required: true,
                width: 'third',
                options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                conditionalWings: [],
                mapToCore: 'year'
            },
            {
                id: 'nk_strengths',
                type: 'checkbox_group',
                label: 'Street Theatre Strengths',
                required: true,
                width: 'full',
                options: [
                    'High-Decibel Open-Air Vocal Projection',
                    'Physical Stunts, Pyramids & Body Movement',
                    'Chorus Singing & Folk Composition',
                    'Djembe / Dholak / Dafli Rhythm',
                    'Spontaneous Crowd Interaction & Improv'
                ],
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'nk_energy',
                type: 'rating',
                label: 'Vocal Pitch & Physical Stamina Rating',
                required: true,
                width: 'half',
                maxRating: 10,
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'nk_photo',
                type: 'image_upload',
                label: 'Applicant Photograph',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'photoLink'
            },
            {
                id: 'nk_issue',
                type: 'textarea',
                label: 'What social issue do you think urgently deserves a street play today, and why?',
                placeholder: 'Share your perspective in 3–5 sentences...',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'experience'
            }
        ]
    },
    {
        id: 'backstage-tech-design-intake',
        slug: 'crew-intake',
        title: 'Backstage, Scenography, Media & Tech Crew Intake',
        badge: 'CREATIVE & PRODUCTION CREW',
        subtitle: 'Architects Behind The Curtain',
        description: 'Not everyone on stage wears a costume — some command the light board, cut the trailer, build the set, or run the production console.',
        isLive: false,
        isFeaturedOnJoinUs: false,
        ctaText: 'JOIN THE CREW',
        submitButtonText: 'Submit Crew Portfolio',
        opensAt: '',
        closesAt: '',
        maxSubmissions: 0,
        closedTitle: 'Crew Intake Closed',
        closedMessage: 'Production crew positions for the current play are filled.',
        successTitle: 'Backstage Pass Issued!',
        successMessage: 'Our Production & Media leads will review your portfolio and reach out on WhatsApp.',
        whatsappGroupUrl: '',
        showResourcesLink: false,
        multiStep: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        fields: [
            {
                id: 'cr_name',
                type: 'text',
                label: 'Full Name',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'name'
            },
            {
                id: 'cr_email',
                type: 'email',
                label: 'Email Address',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'email'
            },
            {
                id: 'cr_phone',
                type: 'phone',
                label: 'WhatsApp Contact',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'phone'
            },
            {
                id: 'cr_branch',
                type: 'text',
                label: 'Branch',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'branch'
            },
            {
                id: 'cr_year',
                type: 'select',
                label: 'Year',
                required: true,
                width: 'third',
                options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                conditionalWings: [],
                mapToCore: 'year'
            },
            {
                id: 'cr_role',
                type: 'radio',
                label: 'Primary Crew Track',
                required: true,
                width: 'full',
                options: [
                    'Stage Decor, Set Design & Props',
                    'Cinematography, Video Editing & Trailers',
                    'Graphic Design, Posters & Brand Identity',
                    'Lighting Design & Live Audio Console',
                    'Public Relations, Sponsorship & Event Ops'
                ],
                conditionalWings: [],
                mapToCore: 'role'
            },
            {
                id: 'cr_portfolio',
                type: 'url',
                label: 'Portfolio / Drive / Behance / GitHub / Instagram Work Link',
                placeholder: 'https://...',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'portfolio'
            },
            {
                id: 'cr_photo',
                type: 'image_upload',
                label: 'Your Photograph or Best Design Sample',
                required: false,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'photoLink'
            },
            {
                id: 'cr_exp',
                type: 'textarea',
                label: 'Tell us about your favorite project you have designed, shot, built, or organized',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'experience'
            }
        ]
    },
    {
        id: 'samvid-volunteer-drive',
        slug: 'samvid-volunteers',
        title: 'Samvid Theatre Festival — Organizing Crew & Volunteers',
        badge: 'FESTIVAL OPERATIONS',
        subtitle: 'Host The Grand Stage',
        description: 'Join the core organizing workforce for Samvid — managing guest theatre troupes, stage logistics, hospitality, security, and live media coverage.',
        isLive: false,
        isFeaturedOnJoinUs: false,
        ctaText: 'VOLUNTEER FOR SAMVID',
        submitButtonText: 'Register As Festival Volunteer',
        opensAt: '',
        closesAt: '',
        maxSubmissions: 0,
        closedTitle: 'Volunteer Roster Locked',
        closedMessage: 'The Samvid Festival volunteer roster is now complete.',
        successTitle: 'Welcome To Team Samvid!',
        successMessage: 'Your volunteer badge request has been recorded.',
        whatsappGroupUrl: '',
        showResourcesLink: false,
        multiStep: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        fields: [
            {
                id: 'sv_name',
                type: 'text',
                label: 'Full Name',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'name'
            },
            {
                id: 'sv_email',
                type: 'email',
                label: 'Email Address',
                required: true,
                width: 'half',
                conditionalWings: [],
                mapToCore: 'email'
            },
            {
                id: 'sv_phone',
                type: 'phone',
                label: 'WhatsApp Number',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'phone'
            },
            {
                id: 'sv_branch',
                type: 'text',
                label: 'Branch',
                required: true,
                width: 'third',
                conditionalWings: [],
                mapToCore: 'branch'
            },
            {
                id: 'sv_year',
                type: 'select',
                label: 'Academic Year',
                required: true,
                width: 'third',
                options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                conditionalWings: [],
                mapToCore: 'year'
            },
            {
                id: 'sv_committee',
                type: 'radio',
                label: 'Preferred Festival Committee',
                required: true,
                width: 'full',
                options: [
                    'Stage & Backstage Troupe Management',
                    'Guest Judge & College Troupe Hospitality',
                    'Live Photography & Reels Coverage',
                    'Registration Desk & Crowd Control',
                    'Sponsorship & Campus Outreach'
                ],
                conditionalWings: [],
                mapToCore: 'role'
            },
            {
                id: 'sv_availability',
                type: 'availability_grid',
                label: 'Weekly Prep Availability Matrix',
                helpText: 'Click the slots when you are free for festival preparation duties.',
                required: false,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'none'
            },
            {
                id: 'sv_exp',
                type: 'textarea',
                label: 'Any prior event management or volunteering experience?',
                required: true,
                width: 'full',
                conditionalWings: [],
                mapToCore: 'experience'
            }
        ]
    }
];

export const DEFAULT_JOIN_FORMS_CONFIG: JoinFormsGlobalConfig = {
    masterLive: true,
    heroCtaText: 'JOIN US',
    hubMode: 'single',
    primaryFormId: 'swaang-annual-auditions',
    closedDoorTitle: 'The Curtain Is Currently Drawn',
    closedDoorMessage: 'Auditions and recruitment for this cycle have concluded. Keep an eye on our official noticeboard for the next call-sheet.',
    wings: DEFAULT_WINGS,
    forms: FORM_TEMPLATES
};

export function normalizeJoinFormsConfig(raw?: Partial<JoinFormsGlobalConfig> | null): JoinFormsGlobalConfig {
    if (!raw || typeof raw !== 'object') {
        return structuredClone(DEFAULT_JOIN_FORMS_CONFIG);
    }

    const wings = Array.isArray(raw.wings) && raw.wings.length > 0
        ? raw.wings
        : structuredClone(DEFAULT_WINGS);

    const forms = Array.isArray(raw.forms) && raw.forms.length > 0
        ? raw.forms
        : structuredClone(FORM_TEMPLATES);

    const primaryFormId = raw.primaryFormId && forms.some(f => f.id === raw.primaryFormId)
        ? raw.primaryFormId
        : forms[0].id;

    return {
        masterLive: typeof raw.masterLive === 'boolean' ? raw.masterLive : true,
        heroCtaText: raw.heroCtaText?.trim() || 'JOIN US',
        hubMode: raw.hubMode === 'hub' ? 'hub' : 'single',
        primaryFormId,
        closedDoorTitle: raw.closedDoorTitle?.trim() || DEFAULT_JOIN_FORMS_CONFIG.closedDoorTitle,
        closedDoorMessage: raw.closedDoorMessage?.trim() || DEFAULT_JOIN_FORMS_CONFIG.closedDoorMessage,
        wings,
        forms
    };
}

import { useState, type CSSProperties } from "react";
import {
  ONBOARDING_KEY,
  TRADITION_KEY,
  OBSERVED_KEY,
  CITY_KEY,
  LOCATION_KEY,
  REGION_KEY,
  LOCATION_OPTIONS,
  getRegionOptionsForLocation,
  getRegionScreenCopy,
  isValidRegionForLocation,
  type Tradition,
  type UserLocation,
  type UserRegion,
} from "@/hooks/useUserPrefs";

const DISCLAIMER_KEY = "vrat_disclaimer_accepted";

interface Props {
  onComplete: () => void;
}

// ─── Vrat catalogue for Screen 3 ────────────────────────────────────────────
const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" | "Warkari" | "Ramanandi" | "SriVaishnava" | "Shakta" | "ShaivaSiddhanta" | "Bishnoi" }[] = [
  { id: "ekadashi",                   label: "Ekadashi",                       subtitle: "24 days a year",                      tradition: "Hindu" },
  { id: "purnima",                    label: "Purnima",                        subtitle: "Full moon · 12 days a year",          tradition: "Hindu" },
  { id: "pradosh",                    label: "Pradosh / Pradosham",            subtitle: "For Lord Shiva · 24 days a year",     tradition: "Hindu" },
  { id: "amavasya",                   label: "Amavasya",                       subtitle: "New moon · 12 days a year",           tradition: "Hindu" },
  { id: "sankashti",                  label: "Sankashti Chaturthi",            subtitle: "For Lord Ganesha · 12 days a year",   tradition: "Hindu" },
  { id: "maha-shivratri",             label: "Maha Shivratri",                 subtitle: "The great night of Shiva",            tradition: "Hindu" },
  { id: "navratri",                   label: "Navratri",                       subtitle: "Nine nights of Durga · twice a year", tradition: "Hindu" },
  { id: "janmashtami",                label: "Janmashtami",                    subtitle: "Birth of Lord Krishna",               tradition: "Hindu" },
  { id: "ram-navami",                 label: "Ram Navami",                     subtitle: "Birth of Lord Ram",                   tradition: "Hindu" },
  { id: "hanuman-jayanti",            label: "Hanuman Jayanti",                subtitle: "Hanuman ji",                          tradition: "Hindu" },
  { id: "ganesh-chaturthi",           label: "Ganesh Chaturthi",               subtitle: "Birth of Lord Ganesha",               tradition: "Hindu" },
  { id: "diwali",                     label: "Deepawali / Lakshmi Puja",          subtitle: "Festival of lights",                  tradition: "Hindu" },
  { id: "karva-chauth",               label: "Karva Chauth",                   subtitle: "For a husband's long life",           tradition: "Hindu" },
  { id: "hartalika-teej",             label: "Hartalika Teej",                 subtitle: "For Lord Shiva and Parvati",          tradition: "Hindu" },
  { id: "hariyali-teej",              label: "Hariyali Teej",                  subtitle: "Monsoon celebration of Parvati",      tradition: "Hindu" },
  { id: "vat-savitri",                label: "Vat Savitri",                    subtitle: "For a husband's longevity",           tradition: "Hindu" },
  { id: "ahoi-ashtami",               label: "Ahoi Ashtami",                   subtitle: "For children's wellbeing",            tradition: "Hindu" },
  { id: "chhath-puja",                label: "Chhath Puja",                    subtitle: "For the Sun God · 36-hour strict fast", tradition: "Hindu" },
  { id: "akshaya-tritiya",            label: "Akshaya Tritiya",                subtitle: "The auspicious third",                tradition: "Hindu" },
  { id: "mahavir-jayanti",            label: "Mahavir Jayanti",                subtitle: "Birth of Lord Mahavira",              tradition: "Jain" },
  { id: "paryushana",                 label: "Paryushana",                     subtitle: "Eight days of reflection and fasting", tradition: "Jain" },
  { id: "samvatsari",                 label: "Samvatsari Pratikraman",         subtitle: "Annual day of forgiveness",           tradition: "Jain" },
  { id: "navpad-oli",                 label: "Navpad Oli",                     subtitle: "Nine days of austerity · twice a year", tradition: "Jain" },
  { id: "das-lakshana",               label: "Das Lakshana Parva",             subtitle: "Ten days of dharma",                  tradition: "Jain" },
  { id: "mahavira-nirvana",           label: "Mahavira Nirvana",               subtitle: "Jain Deepawali · day of liberation",     tradition: "Jain" },
  { id: "guru-gobind-singh-gurpurab",   label: "Guru Gobind Singh Ji Gurpurab",      subtitle: "Poh 7 (Jan 6) · 10th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "maghi",                        label: "Maghi",                              subtitle: "Magh 1 (Jan 14) · Battle of Muktsar",              tradition: "Sikh" },
  { id: "guru-har-rai-jayanti",         label: "Guru Har Rai Ji Jayanti",            subtitle: "Magh 18 (Jan 31) · 7th Guru's Gurpurab",           tradition: "Sikh" },
  { id: "guru-ravidas-jayanti",         label: "Guru Ravidas Ji Jayanti",            subtitle: "Phagan 1 (Feb 12) · Poet-saint's Jayanti",         tradition: "Sikh" },
  { id: "hola-mohalla",                 label: "Hola Mohalla",                       subtitle: "Phagan 19 (Mar 4) · Khalsa martial arts festival",  tradition: "Sikh" },
  { id: "baisakhi-sikh",                label: "Baisakhi (Vaisakhi)",                subtitle: "Vaisakh 1 (Apr 14) · Khalsa Sajna Divas",          tradition: "Sikh" },
  { id: "guru-arjan-dev-shaheedi",      label: "Guru Arjan Dev Ji Shaheedi Divas",   subtitle: "Harh 2 (Jun 16) · 5th Guru's Martyrdom Day",       tradition: "Sikh" },
  { id: "guru-hargobind-jayanti",       label: "Guru Hargobind Ji Gurpurab",         subtitle: "Harh 5 (Jun 19) · 6th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "guru-har-krishan-jayanti",     label: "Guru Har Krishan Ji Gurpurab",       subtitle: "Sawan 8 (Jul 23) · 8th Guru's Gurpurab",           tradition: "Sikh" },
  { id: "sangrand",                     label: "Sangrand",                           subtitle: "1st of each Nanakshahi month · 12 per year",       tradition: "Sikh" },
  { id: "guru-ram-das-jayanti",         label: "Guru Ram Das Ji Gurpurab",           subtitle: "Assu 24 (Oct 9) · 4th Guru's Gurpurab",            tradition: "Sikh" },
  { id: "guru-granth-sahib-gurgaddi",  label: "Guru Granth Sahib Ji Gurgaddi Divas",subtitle: "Katik 5 (Oct 20) · Eternal Guru enthroned",        tradition: "Sikh" },
  { id: "bandi-chhor-divas",           label: "Bandi Chhor Divas",                  subtitle: "Katik 5 (Oct 20) · Day of Liberation",             tradition: "Sikh" },
  { id: "guru-nanak-gurpurab",         label: "Guru Nanak Dev Ji Gurpurab",          subtitle: "Katik 21 (Nov 5) · Founder of Sikhism",            tradition: "Sikh" },
  { id: "guru-tegh-bahadur-shaheedi", label: "Guru Tegh Bahadur Ji Shaheedi Divas", subtitle: "Maghar 10 (Nov 24) · 9th Guru's Martyrdom Day",    tradition: "Sikh" },
  { id: "swaminarayan-jayanti",        label: "Swaminarayan Jayanti",  subtitle: "Chaitra Shukla Navami · Lord Swaminarayan's birth",    tradition: "Swaminarayan" },
  { id: "fuldol-swaminarayan",         label: "Fuldol",                subtitle: "Phalgun Purnima · flower festival before Holi",        tradition: "Swaminarayan" },
  { id: "annakut-swaminarayan",        label: "Annakut",               subtitle: "Day after Deepawali · Swaminarayan New Year offering",    tradition: "Swaminarayan" },
  { id: "ekadashi-swaminarayan-jan-1", label: "Swaminarayan Ekadashi", subtitle: "Ekadashi with strict satvik fast · no onion, garlic", tradition: "Swaminarayan" },
  { id: "shastriji-maharaj-jayanti-baps",     label: "Shastriji Maharaj Jayanti",        subtitle: "Maha Sud 5 (Vasant Panchami) · BAPS founder appearance",       tradition: "Swaminarayan" },
  { id: "yogiji-maharaj-jayanti-baps",        label: "Yogiji Maharaj Jayanti",           subtitle: "Vaishakh Vad 12 · 4th BAPS guru appearance",                    tradition: "Swaminarayan" },
  { id: "pramukh-swami-jayanti-baps",         label: "Pramukh Swami Maharaj Jayanti",    subtitle: "Maha Vad 8 (Dec 7) · 5th BAPS guru appearance",                 tradition: "Swaminarayan" },
  { id: "mahant-swami-jayanti-baps",          label: "Mahant Swami Maharaj Jayanti",     subtitle: "Bhadarva Sud 1 (Sept 13) · current BAPS pragat guru",           tradition: "Swaminarayan" },
  { id: "gunatitanand-swami-jayanti-baps",    label: "Gunatitanand Swami Jayanti",       subtitle: "Aso Sud 15 (Sharad Purnima) · 1st Aksharbrahman guru",          tradition: "Swaminarayan" },
  { id: "bhagatji-maharaj-jayanti-baps",      label: "Bhagatji Maharaj Jayanti",         subtitle: "Maha Vad 11 · 2nd Aksharbrahman guru appearance",               tradition: "Swaminarayan" },
  { id: "pramukh-swami-punyatithi-baps",      label: "Pramukh Swami Maharaj Punyatithi", subtitle: "Aug 13 · akshar-vihar of 5th BAPS guru (2016)",                 tradition: "Swaminarayan" },
  { id: "yogiji-maharaj-punyatithi-baps",     label: "Yogiji Maharaj Punyatithi",        subtitle: "Magh Vad 8 (Jan 23) · akshar-vihar of 4th BAPS guru (1971)",    tradition: "Swaminarayan" },
  { id: "shastriji-maharaj-punyatithi-baps",  label: "Shastriji Maharaj Punyatithi",     subtitle: "Vaishakh Sud 5 · akshar-vihar of BAPS founder (1951)",          tradition: "Swaminarayan" },
  { id: "gunatitanand-swami-punyatithi-baps", label: "Gunatitanand Swami Punyatithi",    subtitle: "Aso Vad 12 · akshar-vihar of 1st Aksharbrahman guru (1867)",    tradition: "Swaminarayan" },
  { id: "baps-sthapana-din",                  label: "BAPS Sthapana Din",                subtitle: "June 5 · founding of BAPS at Bochasan (1907)",                  tradition: "Swaminarayan" },
  { id: "akshardham-delhi-pratishtha-baps",   label: "Akshardham Delhi Pratishtha",      subtitle: "Nov 6 · Akshardham Delhi consecration (2005)",                  tradition: "Swaminarayan" },
  { id: "akshardham-nj-pratishtha-baps",      label: "Akshardham New Jersey Pratishtha", subtitle: "Oct 8 · Akshardham NJ consecration (2023)",                     tradition: "Swaminarayan" },
  { id: "abu-dhabi-mandir-pratishtha-baps",   label: "BAPS Hindu Mandir Abu Dhabi Pratishtha", subtitle: "Feb 14 · first Hindu stone temple in Middle East (2024)", tradition: "Swaminarayan" },
  { id: "hindola-utsav-baps",                 label: "Hindola Utsav",                    subtitle: "Sravan · 5-day BAPS swing festival",                            tradition: "Swaminarayan" },
  { id: "pushpadolotsav-baps",                label: "Pushpadolotsav",                   subtitle: "Phagan Sud 13 · BAPS flower-shower festival",                   tradition: "Swaminarayan" },
  { id: "iskcon-ekadashi",       label: "Ekadashi (Vaishnava)",  subtitle: "No grains · 24 days a year · Parana next morning",    tradition: "ISKCON" },
  { id: "janmashtami-iskcon",    label: "Janmashtami",           subtitle: "Midnight fast · Lord Krishna's appearance day",        tradition: "ISKCON" },
  { id: "gaura-purnima",         label: "Gaura Purnima",         subtitle: "Sri Chaitanya Mahaprabhu's appearance day",            tradition: "ISKCON" },
  { id: "radhashtami",           label: "Radhashtami",           subtitle: "Srimati Radharani's appearance day",                   tradition: "ISKCON" },
  { id: "kartik-damodara",          label: "Kartik Damodara Month", subtitle: "Month-long vow · daily ghee lamp offering",           tradition: "ISKCON" },
  { id: "nityananda-trayodashi",    label: "Nityananda Trayodashi", subtitle: "Sri Nityananda Prabhu's appearance day",              tradition: "ISKCON" },
  { id: "narasimha-chaturdashi",    label: "Narasimha Chaturdashi", subtitle: "Vaishakha Shukla 14 · fast until sunset · Lord Narasimha", tradition: "ISKCON" },
  // Mayapur Vaishnava Calendar additions — major festivals
  { id: "ramanavami-iskcon",                  label: "Sri Rama Navami",                          subtitle: "Caitra Shukla 9 · no grains till sunset · Lord Rama's appearance",        tradition: "ISKCON" },
  { id: "akshaya-tritiya-iskcon",             label: "Akshaya Tritiya / Chandana Yatra",         subtitle: "21-day sandalwood-cooling vrata for the deities begins",                  tradition: "ISKCON" },
  { id: "snana-yatra-iskcon",                 label: "Sri Snana Yatra",                          subtitle: "Jyestha Purnima · Jagannatha's public bathing festival",                  tradition: "ISKCON" },
  { id: "ratha-yatra-iskcon",                 label: "Sri Jagannatha Ratha Yatra",               subtitle: "Asadha Shukla 2 · the worldwide chariot festival",                        tradition: "ISKCON" },
  { id: "hera-pancami-iskcon",                label: "Hera Pancami",                             subtitle: "Lakshmi Devi's visit to Jagannatha at Gundicha",                          tradition: "ISKCON" },
  { id: "ulta-ratha-iskcon",                  label: "Ulta Ratha / Bahuda Yatra",                subtitle: "Return chariot procession 9 days after Ratha Yatra",                      tradition: "ISKCON" },
  { id: "caturmasya-begins-iskcon",           label: "Sayana Ekadashi (Caturmasya begins)",      subtitle: "4-month Vishnu yoga-nidra vrata begins",                                  tradition: "ISKCON" },
  { id: "jhulan-yatra-iskcon",                label: "Jhulan Yatra",                             subtitle: "5-day Radha-Krishna swing festival",                                      tradition: "ISKCON" },
  { id: "balarama-purnima-iskcon",            label: "Sri Balarama Avirbhava",                   subtitle: "Sravana Purnima · Lord Balarama's appearance",                            tradition: "ISKCON" },
  { id: "vyasa-puja-iskcon",                  label: "Sri Vyasa Puja (Srila Prabhupada Avirbhava)", subtitle: "ISKCON Founder-Acharya's appearance day",                              tradition: "ISKCON" },
  { id: "lalita-sasthi-iskcon",               label: "Sri Lalita Sasthi",                        subtitle: "Bhadra Shukla 6 · chief sakhi of Radharani",                              tradition: "ISKCON" },
  { id: "vamana-dvadasi-iskcon",              label: "Sri Vamana Avirbhava",                     subtitle: "Bhadra Shukla 12 · the 5th Dashavatara",                                  tradition: "ISKCON" },
  { id: "bahulastami-iskcon",                 label: "Sri Radha-kunda Avirbhava (Bahulastami)",  subtitle: "Kartika Krishna 8 · midnight snana at Radha-kunda",                       tradition: "ISKCON" },
  { id: "govardhan-puja-iskcon",              label: "Sri Govardhan Puja / Annakuta",            subtitle: "Day after Diwali · mountain of food offered to Govardhan",                tradition: "ISKCON" },
  { id: "srila-prabhupada-tirobhava-iskcon",  label: "Srila Prabhupada Tirobhava",               subtitle: "Kartik Shukla 4 · ISKCON's most solemn day",                              tradition: "ISKCON" },
  { id: "utthana-ekadashi-iskcon",            label: "Probodhini / Utthana Ekadashi",            subtitle: "Caturmasya ends · Lord Vishnu awakens",                                   tradition: "ISKCON" },
  { id: "bhishma-pancaka-iskcon",             label: "Bhishma Pancaka",                          subtitle: "Final 5 days of Kartika · spiritual climax",                              tradition: "ISKCON" },
  { id: "tulasi-vivaha-iskcon",               label: "Sri Tulasi-Saligrama Vivaha",              subtitle: "Wedding of Tulasi Devi to Saligrama-sila",                                tradition: "ISKCON" },
  { id: "krishna-pushya-abhishek-iskcon",     label: "Sri Krishna Pushya Abhishek",              subtitle: "Pausha Purnima · Krishna's annual coronation",                            tradition: "ISKCON" },
  // Acharya appearance / disappearance days
  { id: "ramanujacarya-tirobhava-iskcon",     label: "Sri Ramanujacharya Tirobhava",             subtitle: "Founder-acharya of Sri Vaishnavism (in our parampara)",                   tradition: "ISKCON" },
  { id: "sanatana-goswami-tirobhava-iskcon",  label: "Sri Sanatana Goswami Tirobhava",           subtitle: "Eldest of Six Goswamis · Sri Madana-mohana",                              tradition: "ISKCON" },
  { id: "rupa-goswami-tirobhava-iskcon",      label: "Sri Rupa Goswami Tirobhava",               subtitle: "Founder of bhakti-rasa shastra · Sri Govindaji",                          tradition: "ISKCON" },
  { id: "jiva-goswami-tirobhava-iskcon",      label: "Sri Jiva Goswami Tirobhava",               subtitle: "Author of Sat-sandarbhas · Sri Radha-Damodara",                           tradition: "ISKCON" },
  { id: "haridasa-thakura-tirobhava-iskcon",  label: "Sri Haridasa Thakura Tirobhava",           subtitle: "Namacharya — supreme exemplar of the holy name",                          tradition: "ISKCON" },
  { id: "narottama-dasa-tirobhava-iskcon",    label: "Sri Narottama Das Thakura Tirobhava",      subtitle: "Bengali bhajan poet · Prarthana / Prema-bhakti-candrika",                 tradition: "ISKCON" },
  { id: "advaita-acarya-avirbhava-iskcon",    label: "Sri Advaita Acarya Avirbhava",             subtitle: "Eldest of the Pancha Tattva · called Sri Caitanya to descend",            tradition: "ISKCON" },
  { id: "madhvacarya-tirobhava-iskcon",       label: "Sri Madhvacharya Tirobhava",               subtitle: "Founder of the Brahma-Madhva sampradaya in our parampara",                tradition: "ISKCON" },
  { id: "bhaktivinoda-thakura-avirbhava-iskcon", label: "Srila Bhaktivinoda Thakura Avirbhava",  subtitle: "The Seventh Goswami · Srila Prabhupada's parama-parama-guru",             tradition: "ISKCON" },
  { id: "bhaktisiddhanta-tirobhava-iskcon",   label: "Srila Bhakti Siddhanta Tirobhava",         subtitle: "Srila Prabhupada's diksha-guru · Gaudiya Math founder",                   tradition: "ISKCON" },
  { id: "gaurakishora-tirobhava-iskcon",      label: "Srila Gaurakishora Das Babaji Tirobhava",  subtitle: "Srila Bhakti Siddhanta's diksha-guru · renunciate babaji",                tradition: "ISKCON" },
  { id: "ugadi-lingayat",            label: "Ugadi (Kannada New Year)", subtitle: "Feb 15 · Ishtalinga puja · Ugadi Pachadi",         tradition: "Lingayat" },
  { id: "maha-shivaratri-lingayat", label: "Maha Shivaratri",  subtitle: "Nirjala fast · all-night Ishtalinga worship",             tradition: "Lingayat" },
  { id: "somavara-lingayat",        label: "Shravana Somavara",   subtitle: "Mondays of Shravana · fruit fast · Ishtalinga puja to Lord Shiva",     tradition: "Lingayat" },
  { id: "basava-jayanti",           label: "Basava Jayanti",    subtitle: "Apr 20 · Basavanna's birth anniversary",                 tradition: "Lingayat" },
  { id: "varalakshmi-vratam-lingayat", label: "Varamahalakshmi Vratam", subtitle: "Aug 28 · Goddess Varamahalakshmi · women's vrat",       tradition: "Lingayat" },
  { id: "lakshmi-puja-lingayat",       label: "Lakshmi Puja — Deepawali", subtitle: "Nov 8 · Festival of lights · Ishtalinga puja first", tradition: "Lingayat" },
  { id: "allama-prabhu-jayanti",          label: "Allama Prabhu Jayanti",          subtitle: "Margashira · Shunyasimhasanadhipati of Anubhava Mantapa",      tradition: "Lingayat" },
  { id: "akkamahadevi-jayanti",           label: "Akkamahadevi Jayanti",           subtitle: "Magha Sud 4 · supreme woman-sharana",                          tradition: "Lingayat" },
  { id: "channabasavanna-jayanti",        label: "Channabasavanna Jayanti",        subtitle: "Vaisakha Sud 1 · author of Karana Hasuge",                     tradition: "Lingayat" },
  { id: "siddharama-jayanti",             label: "Siddharama Jayanti",             subtitle: "Yogi-sharana of Solapur · builder of 68 lakes",                tradition: "Lingayat" },
  { id: "renukacharya-jayanti",           label: "Renukacharya Jayanti",           subtitle: "Karthika Sud 5 · 1st Pancharcharya, Rambhapuri Pitha",         tradition: "Lingayat" },
  { id: "anubhava-mantapa-sthapana",      label: "Anubhava Mantapa Sthapana Din",  subtitle: "Akshaya Tritiya · Basavanna's Kalyana academy (~1160 CE)",     tradition: "Lingayat" },
  { id: "basavanna-lingaikya",            label: "Basavanna Lingaikya Din",        subtitle: "Shravana Sud 5 · Kudalasangama lingaikya (1167)",              tradition: "Lingayat" },
  { id: "akkamahadevi-lingaikya",         label: "Akkamahadevi Lingaikya Din",     subtitle: "Vaisakha · Kadali Vana / Srisaila lingaikya",                  tradition: "Lingayat" },
  { id: "pradosha-vrata-lingayat",        label: "Pradosha Vrata",                 subtitle: "Trayodashi twilight Shiva-puja · 24 times yearly",             tradition: "Lingayat" },
  { id: "karthika-somavara-lingayat",     label: "Karthika Somavara",              subtitle: "Mondays of Karthika · most sacred Shiva-fasting",              tradition: "Lingayat" },
  { id: "karthika-purnima-lingayat",      label: "Karthika Purnima (Tripurari)",   subtitle: "Karthika full moon · Karthika Deepotsava culmination",         tradition: "Lingayat" },
  { id: "karthika-vana-bhojana",          label: "Karthika Vana Bhojana",          subtitle: "Karthika community feast under bilva trees",                   tradition: "Lingayat" },
  { id: "datta-jayanti-lingayat",         label: "Datta Jayanti",                  subtitle: "Margashirsha Purnima · Lord Dattatreya appearance",            tradition: "Lingayat" },
  { id: "mauni-amavasya-lingayat",        label: "Mauni Amavasya",                 subtitle: "Magha Amavasya · day-long mauna (silence) vrata",              tradition: "Lingayat" },
  { id: "nagara-panchami-lingayat",       label: "Nagara Panchami",                subtitle: "Shravana Sud 5 · Naga-deities as Vasuki/Shiva",                tradition: "Lingayat" },
  { id: "kudalasangama-jatra",            label: "Kudalasangama Jatra",            subtitle: "Annual Basavanna pilgrimage · largest Lingayat jatra",         tradition: "Lingayat" },
  { id: "srisaila-mallikarjuna-jatra",    label: "Srisaila Mallikarjuna Jatra",    subtitle: "Maha Shivaratri at 2nd Jyotirlinga · Akkamahadevi lingaikya",  tradition: "Lingayat" },
  { id: "banashankari-jatra",             label: "Banashankari Jatra",             subtitle: "Pushya/Magha · Banashankari Devi at Cholachagudd",             tradition: "Lingayat" },
  { id: "ekadashi-pushti-marg",  label: "Ekadashi",              subtitle: "Grain-free seva · offer bhog to Shrinathji first",     tradition: "PushtiMarg" },
  { id: "janmashtami-pushti-marg",label: "Janmashtami",          subtitle: "Most sacred · Chappan Bhog at midnight · Nandotsav next day", tradition: "PushtiMarg" },
  { id: "annakut-pushti-marg",   label: "Annakut & Govardhan Puja", subtitle: "Day after Deepawali · Chappan Bhog seva",             tradition: "PushtiMarg" },
  { id: "phoolon-wali-holi",     label: "Phoolon wali Holi",    subtitle: "Falgun Purnima · flower Holi at Shrinathji's haveli",   tradition: "PushtiMarg" },
  { id: "hindola-utsav",         label: "Hindola Utsav",         subtitle: "Ashadha–Shravana · 40-day swing festival begins",        tradition: "PushtiMarg" },
  { id: "vallabhacharya-jayanti-pushti-marg", label: "Shri Vallabhacharya Mahaprabhuji Jayanti", subtitle: "Champaranya · Vaishakh Krishna 11 · Brahma-Sambandha founder",     tradition: "PushtiMarg" },
  { id: "vitthalnathji-pragatya-pushti-marg", label: "Shri Vitthalnathji Gusainji Pragatya",   subtitle: "Charanat · Magh Krishna 9 · Saptama Gosvami parampara organizer",      tradition: "PushtiMarg" },
  { id: "shrinathji-prakatya-utsav",          label: "Shrinathji Swayam-vyakta Prakatya",      subtitle: "Mt. Govardhan · Margashirsha Sud 14 · self-manifested murti",          tradition: "PushtiMarg" },
  { id: "shrinathji-nathdwara-patotsav",      label: "Shrinathji Nathdwara Pravesh Patotsav",  subtitle: "Nathdwara · Magh Krishna 7 · 1672 CE arrival from Govardhan",          tradition: "PushtiMarg" },
  { id: "chandan-yatra-pushti-marg",          label: "Chandan Yatra (Akshay Tritiya)",         subtitle: "21-day chandan-seva · first-mango offering · Shrinathji haveli",        tradition: "PushtiMarg" },
  { id: "rath-yatra-pushti-marg",             label: "Rath Yatra (Pushti Marg)",               subtitle: "Ashadh Sud 2 · Shrinathji on the rath · most public haveli darshan",   tradition: "PushtiMarg" },
  { id: "pavitra-ekadashi-pushti-marg",       label: "Pavitra Ekadashi (Pavitra Seva)",        subtitle: "Shravan Sud 11 · sacred-thread garlands offered to Shrinathji",        tradition: "PushtiMarg" },
  { id: "sharad-purnima-ras-pushti-marg",     label: "Sharad Purnima (Maha Ras Utsav)",        subtitle: "Ashwin Purnima · moonlight-kheer · supreme rasa-utsav of the year",    tradition: "PushtiMarg" },
  { id: "damodar-maas-pushti-marg",           label: "Damodar Maas (Kartik Diya-Seva)",        subtitle: "Entire Kartik · daily diya · Damodarashtaka · til-gud bhog",           tradition: "PushtiMarg" },
  { id: "vasantotsav-pushti-marg",            label: "Vasantotsav (Vasant Panchami)",          subtitle: "Magh Sud 5 · spring opening · 40-day kesari haveli seva",              tradition: "PushtiMarg" },
  { id: "holi-dol-utsav-pushti-marg",         label: "Holi Dahan & Dol Utsav",                 subtitle: "Phalgun Purnima + Dhulendi · haveli phag-rasa kirtan & gulal",         tradition: "PushtiMarg" },
  { id: "khichdi-utsav-pushti-marg",          label: "Khichdi Utsav (Makar Sankranti)",        subtitle: "Jan 14 · winter khichdi-seva · Uttarayana-arambh",                     tradition: "PushtiMarg" },

  { id: "ashadhi-ekadashi-warkari",   label: "Ashadhi Ekadashi (Devshayani)",      subtitle: "Pandharpur Wari · Vitthal yoga-nidra begins",            tradition: "Warkari" },
  { id: "kartiki-ekadashi-warkari",   label: "Kartiki Ekadashi (Prabodhini)",      subtitle: "Vitthal awakens · second Pandharpur Wari",               tradition: "Warkari" },
  { id: "maghi-ekadashi-warkari",     label: "Maghi Ekadashi (Jaya)",              subtitle: "Jaya Ekadashi · prelude to Tukaram Beej",                 tradition: "Warkari" },
  { id: "tukaram-beej",               label: "Tukaram Beej",                       subtitle: "Sant Tukaram's vaikuntha-gaman at Dehu",                  tradition: "Warkari" },
  { id: "dnyaneshwar-punyatithi",     label: "Dnyaneshwar Punyatithi",             subtitle: "Mauli's Sanjeevan Samadhi at Alandi",                     tradition: "Warkari" },
  { id: "dnyaneshwar-jayanti-warkari",     label: "Sant Dnyaneshwar Jayanti (Mauli Janma)", subtitle: "Apegaon · Mauli's appearance day · Shravan Krishna Ashtami",  tradition: "Warkari" },
  { id: "tukaram-jayanti-warkari",         label: "Sant Tukaram Jayanti (Tukoba Janma)",    subtitle: "Dehu · Vasant Panchami · Magha Shukla Panchami",               tradition: "Warkari" },
  { id: "eknath-shashthi-warkari",         label: "Sant Eknath Shashthi",                   subtitle: "Paithan · jal-samadhi in the Godavari · Phalgun Vad 6",        tradition: "Warkari" },
  { id: "namdev-punyatithi-warkari",       label: "Sant Namdev Punyatithi",                 subtitle: "Pandharpur · first samadhi-step at Vitthal Mandir",            tradition: "Warkari" },
  { id: "janabai-punyatithi-warkari",      label: "Sant Janabai Punyatithi",                subtitle: "Pandharpur · the maid-disciple · same day as Namdev",          tradition: "Warkari" },
  { id: "muktabai-punyatithi-warkari",     label: "Sant Muktabai Punyatithi (Vidyut-jyoti)",subtitle: "Mehun · Mauli's sister · vidyut-jyoti samadhi",                tradition: "Warkari" },
  { id: "nivruttinath-punyatithi-warkari", label: "Sant Nivruttinath Punyatithi",           subtitle: "Trimbakeshwar · Mauli's elder brother and guru",               tradition: "Warkari" },
  { id: "sopankaka-punyatithi-warkari",    label: "Sant Sopankaka Punyatithi",              subtitle: "Sasvad · Mauli's younger brother · Karha river samadhi",       tradition: "Warkari" },
  { id: "chokhamela-punyatithi-warkari",   label: "Sant Chokhamela Punyatithi",             subtitle: "Mangalvedha · Mahar-sant · second samadhi-step at Pandharpur", tradition: "Warkari" },
  { id: "gora-kumbhar-punyatithi-warkari", label: "Sant Gora Kumbhar Punyatithi",           subtitle: "Terdhoki · the potter-saint · Goroba Kaka",                    tradition: "Warkari" },
  { id: "savata-mali-punyatithi-warkari",  label: "Sant Savata Mali Punyatithi",            subtitle: "Aran · the gardener-saint · Vitthal in every plant",           tradition: "Warkari" },
  { id: "ashadhi-wari-palkhi-prasthan",    label: "Ashadhi Wari Palkhi Prasthan",           subtitle: "Alandi & Dehu · ~21 days before Ashadhi · the great Wari begins",tradition: "Warkari" },

  { id: "ram-navami-ramanandi",       label: "Ram Navami (Ramanandi)",             subtitle: "Sri Ram's appearance · Ayodhya darshan",                  tradition: "Ramanandi" },
  { id: "hanuman-jayanti-ramanandi",  label: "Hanuman Jayanti (Ramanandi)",        subtitle: "Sankat Mochan · Sundara Kanda parayan",                   tradition: "Ramanandi" },
  { id: "sita-navami",                label: "Sita Navami (Janaki Jayanti)",       subtitle: "Devi Sita's appearance at Janakpur",                      tradition: "Ramanandi" },
  { id: "vivah-panchami",             label: "Vivah Panchami",                     subtitle: "Sita-Ram divine wedding day",                              tradition: "Ramanandi" },
  { id: "purnima-ramanandi",          label: "Purnima Vrat (Ramanandi)",           subtitle: "Monthly full-moon Sita-Ram fast · Vikram Samvat",          tradition: "Ramanandi" },
  { id: "tulsi-vivah-ramanandi",      label: "Tulsi Vivah (Ramanandi)",            subtitle: "Tulsi-Vrinda married to Shaligram-Ram",                   tradition: "Ramanandi" },
  { id: "ekadashi-ramanandi",            label: "Ekadashi Vrat (Ramanandi)",        subtitle: "24/yr · strict no-grain Vaishnava fast",                  tradition: "Ramanandi" },
  { id: "sankashti-chaturthi-ramanandi", label: "Sankashti Chaturthi (Ramanandi)",  subtitle: "12/yr · monthly Ganesh fast before Ram seva",             tradition: "Ramanandi" },
  { id: "amavasya-ramanandi",            label: "Amavasya · Pitru Tarpan",          subtitle: "12/yr · monthly Sarayu snan & ancestor offerings",        tradition: "Ramanandi" },
  { id: "akshaya-tritiya-ramanandi",     label: "Akshaya Tritiya",                  subtitle: "Vaishakha Shukla 3 · Chandan Yatra begins at Ayodhya",    tradition: "Ramanandi" },
  { id: "ganga-dussehra-ramanandi",      label: "Ganga Dussehra",                   subtitle: "Jyeshtha Shukla 10 · Sarayu-avataran day at Ayodhya",     tradition: "Ramanandi" },
  { id: "ratha-yatra-ramanandi",         label: "Ratha Yatra (Ramanandi)",          subtitle: "Ashadha Shukla 2 · Sri Ram chariot procession",           tradition: "Ramanandi" },
  { id: "devshayani-ekadashi-ramanandi", label: "Devshayani Ekadashi · Chaturmas begins", subtitle: "Ashadha Shukla 11 · Sri Ram enters Yoga-nidra",     tradition: "Ramanandi" },
  { id: "jhulan-yatra-ramanandi",        label: "Jhulan Yatra",                     subtitle: "5-day monsoon swing-festival for Sita-Ram",               tradition: "Ramanandi" },
  { id: "krishna-janmashtami-ramanandi", label: "Krishna Janmashtami (Ramanandi)",  subtitle: "Bhadrapada Krishna 8 · midnight bal-Krishna abhishekam",  tradition: "Ramanandi" },
  { id: "annakut-ramanandi",             label: "Govardhan Puja · Annakut",         subtitle: "Kartik Shukla 1 · 56-item bhog for Ram darbar",           tradition: "Ramanandi" },
  { id: "prabodhini-ekadashi-ramanandi", label: "Prabodhini Ekadashi · Chaturmas ends",   subtitle: "Kartik Shukla 11 · Sri Ram awakens",                tradition: "Ramanandi" },
  { id: "makar-sankranti-ramanandi",     label: "Makar Sankranti · Sarayu Snan",    subtitle: "Jan 14 · Surya kuladevata of Sri Ram's Suryavansha",      tradition: "Ramanandi" },
  { id: "magha-mela-ramanandi",          label: "Magha Mela · Prayagraj Snan",      subtitle: "Magha Purnima · Triveni Sangam kalpvas",                  tradition: "Ramanandi" },
  { id: "vasant-panchami-ramanandi",     label: "Vasant Panchami (Ramanandi)",      subtitle: "Magha Shukla 5 · Saraswati + Sita vani-shakti",           tradition: "Ramanandi" },
  { id: "holi-ramanandi",                label: "Holi · Phalguna Purnima",          subtitle: "Sita-Ram colour-festival at Ayodhya · alcohol-free",      tradition: "Ramanandi" },

  { id: "ekadashi-srivaishnava",                 label: "Ekadashi (Sri Vaishnava · Bhagavata)", subtitle: "Fortnightly Vishnu fast · verify with local SV panchangam",       tradition: "SriVaishnava" },
  { id: "vaikuntha-ekadashi",                    label: "Vaikuntha Ekadashi (Mukkoti)",         subtitle: "Northern Gate of Vaikuntha opens · Margazhi",                     tradition: "SriVaishnava" },
  { id: "adhyayana-utsavam",                     label: "Adhyayana Utsavam",                    subtitle: "22-day Tiruvaymozhi recitation at Srirangam",                     tradition: "SriVaishnava" },
  { id: "andal-tirunakshatram-srivaishnava",     label: "Andal Tirunakshatram (Aadi Pooram)",   subtitle: "Andal Jayanti at Srivilliputhur · Tirukalyanam",                  tradition: "SriVaishnava" },
  { id: "nammazhwar-tirunakshatram-srivaishnava",label: "Nammazhwar Tirunakshatram",            subtitle: "Vaikasi Visakam · chief of the 12 Azhwars",                       tradition: "SriVaishnava" },
  { id: "ramanuja-jayanti",                      label: "Ramanuja Jayanti",                     subtitle: "Sri Ramanujacharya's Tirunakshatram",                             tradition: "SriVaishnava" },
  { id: "vedanta-desika-tirunakshatram-srivaishnava", label: "Vedanta Desika Tirunakshatram",   subtitle: "Purattasi Sravanam · foremost Vadakalai poorvacharya",            tradition: "SriVaishnava" },
  { id: "manavala-mamuni-tirunakshatram-srivaishnava", label: "Manavala Mamuni Tirunakshatram", subtitle: "Aippasi Tiruvadirai · foremost Tenkalai poorvacharya",            tradition: "SriVaishnava" },
  { id: "nathamuni-tirunakshatram-srivaishnava", label: "Nathamuni Tirunakshatram",             subtitle: "Aani Anusham · first acharya of the Guru-Parampara",              tradition: "SriVaishnava" },
  { id: "yamunacharya-tirunakshatram-srivaishnava", label: "Yamunacharya Tirunakshatram",       subtitle: "Aadi Uttiradam · Sri Alavandar, Stotra Ratna author",             tradition: "SriVaishnava" },
  { id: "panguni-uthiram-srivaishnava",          label: "Panguni Uthiram (Tirukalyanam)",       subtitle: "Tirukalyana day across all 108 divya-desams",                     tradition: "SriVaishnava" },
  { id: "garuda-sevai-srivaishnava",             label: "Garuda Sevai (Tirunangur 11 DD)",      subtitle: "Thai Amavasai · 11 Perumals on 11 Garuda vahanas",                tradition: "SriVaishnava" },
  { id: "hayagriva-jayanti-srivaishnava",        label: "Sri Hayagriva Jayanti",                subtitle: "Sravana Purnima / Avani Avittam · Vedanta Desika's ishta",        tradition: "SriVaishnava" },
  { id: "vamana-jayanti-srivaishnava",           label: "Sri Vamana Jayanti",                   subtitle: "Bhadrapada Shukla Dwadashi + Sravana · Trivikrama at Tirukoyilur", tradition: "SriVaishnava" },
  { id: "pavitrotsavam",                         label: "Pavitrotsavam",                        subtitle: "Annual Pancharatra purification festival",                        tradition: "SriVaishnava" },
  { id: "brahmotsavam-srivaishnava",             label: "Brahmotsavam (Tirumala)",              subtitle: "9-day vahana procession · Garuda Sevai peak",                     tradition: "SriVaishnava" },

  { id: "amavasya-shakta",            label: "Amavasya · Adya Kali Puja",          subtitle: "Monthly new-moon Kali fast · 21 dates (anchor)",          tradition: "Shakta" },
  { id: "sharadiya-navaratri-shakta", label: "Sharadiya Navaratri (Shakta)",       subtitle: "Bengali Durga Puja · 9 nights of Devi",                   tradition: "Shakta" },
  { id: "maha-ashtami-shakta",        label: "Maha Ashtami (Sandhi Puja)",         subtitle: "Day 8 of Navaratri · 48-min Sandhi window",               tradition: "Shakta" },
  { id: "lakshmi-puja-shakta",        label: "Lakshmi Puja (Kojagari)",            subtitle: "Sharad Purnima · all-night vigil for Maa Lakshmi",        tradition: "Shakta" },
  { id: "kali-puja-shakta",           label: "Kali Puja (Shyama Puja)",            subtitle: "Karthik Amavasya · midnight Kali worship",                tradition: "Shakta" },
  { id: "chaitra-navaratri-shakta",   label: "Chaitra Navaratri (Shakta)",         subtitle: "Spring Navaratri · ends with Ram Navami",                 tradition: "Shakta" },
  { id: "phalaharini-kali-puja-shakta", label: "Phalaharini Kali Puja",            subtitle: "Jyeshtha Amavasya · Sri Ramakrishna's Shodashi puja",     tradition: "Shakta" },
  { id: "mahalaya-amavasya-shakta",   label: "Mahalaya Amavasya",                  subtitle: "Bhadrapada Amavasya · Pitru Paksha closes, Devi Paksha begins", tradition: "Shakta" },
  { id: "shakambhari-purnima-shakta", label: "Shakambhari Purnima",                subtitle: "Pausha Purnima · Devi as goddess of greens & grains",     tradition: "Shakta" },
  { id: "magha-gupta-navaratri-shakta", label: "Magha Gupta Navaratri",            subtitle: "Hidden Tantric Navaratri · 10 Mahavidya sadhana",         tradition: "Shakta" },
  { id: "saraswati-puja-shakta",      label: "Saraswati Puja (Vasant Panchami)",   subtitle: "Magha Shukla 5 · Bengal's 2nd-largest festival",          tradition: "Shakta" },
  { id: "lalita-jayanti-shakta",      label: "Lalita Jayanti",                     subtitle: "Magha Purnima · Sri Yantra puja for Tripura Sundari",     tradition: "Shakta" },
  { id: "ashadha-gupta-navaratri-shakta", label: "Ashadha Gupta Navaratri",        subtitle: "Monsoon Tantric Navaratri · 10 Mahavidya retreat",        tradition: "Shakta" },
  { id: "jagaddhatri-puja-shakta",    label: "Jagaddhatri Puja",                   subtitle: "Karthik Shukla 9 · Krishnanagar/Chandannagar Devi festival", tradition: "Shakta" },
  { id: "annapurna-jayanti-shakta",   label: "Annapurna Jayanti",                  subtitle: "Margashirsha Purnima · Kashi Annapurna · anna-dana day",  tradition: "Shakta" },

  { id: "maha-shivaratri-shaiva",     label: "Maha Shivaratri (Shaiva)",           subtitle: "All-night vigil · 4-prahar abhishekam at Chidambaram",   tradition: "ShaivaSiddhanta" },
  { id: "pradosha-shaiva",            label: "Pradosha (Shaiva)",                  subtitle: "Trayodashi sunset puja · 24 days a year",                 tradition: "ShaivaSiddhanta" },
  { id: "aarudra-darshan",            label: "Aarudra Darshan",                    subtitle: "Nataraja's Ananda Tandava · Margazhi Tiruvathirai",       tradition: "ShaivaSiddhanta" },
  { id: "karthigai-deepam-shaiva",    label: "Karthigai Deepam",                   subtitle: "Thiruvannamalai Maha Deepam · Tamil festival of lights",  tradition: "ShaivaSiddhanta" },
  { id: "skanda-shashti-shaiva",      label: "Skanda Shashti (Soorasamharam)",     subtitle: "6-day Murugan vrat · Tiruchendur Soorasamharam",          tradition: "ShaivaSiddhanta" },

  { id: "guru-jambheshwar-jayanti",      label: "Guru Jambheshwar Jayanti",          subtitle: "Bhadrapada Krishna Ashtami · Jambhoji's birth · Pipasar",  tradition: "Bishnoi" },
  { id: "khejarli-shaheed-diwas",        label: "Khejarli Shaheed Diwas",            subtitle: "Amrita Devi & 363 martyrs (1730 CE) · Bhadrapada Sud 10",  tradition: "Bishnoi" },
  { id: "jambhoji-mukti-diwas",          label: "Jambhoji Mukti Diwas",              subtitle: "Magh Krishna Navami · mahaprayan at Lalasar Sathari",      tradition: "Bishnoi" },
  { id: "mukam-mela-asoj-amavasya",      label: "Mukam Mela (Asoj Amavasya)",        subtitle: "Autumn Bishnoi pilgrimage · Samrathal Dhora · Bikaner",    tradition: "Bishnoi" },
  { id: "mukam-mela-phalgun-amavasya",   label: "Mukam Mela (Phalgun Amavasya)",     subtitle: "Spring Bishnoi pilgrimage · before Holi · Mukam",          tradition: "Bishnoi" },
  { id: "bishnoi-holi",                  label: "Bishnoi Holi (Phalgun Purnima)",    subtitle: "Phool gulal only · no green wood · niyam #16",             tradition: "Bishnoi" },
  { id: "bishnoi-mauni-amavasya",        label: "Mauni Amavasya (Monthly Amavasya)", subtitle: "Magha amavasya · silent fast · niyam #14",                 tradition: "Bishnoi" },
  { id: "bishnoi-guru-purnima",          label: "Guru Purnima (Bishnoi)",            subtitle: "Ashadh Purnima · Shabadvani recitation · 29 niyams",       tradition: "Bishnoi" },
  { id: "bishnoi-akshay-tritiya",        label: "Akshay Tritiya (Bishnoi)",          subtitle: "Vraksh-ropan · gau-daan · anna-daan",                      tradition: "Bishnoi" },
  { id: "bishnoi-devshayani-ekadashi",   label: "Devshayani Ekadashi (Chaturmas)",   subtitle: "Ashadh Shukla Ekadashi · 4-month vrat begins",             tradition: "Bishnoi" },
  { id: "bishnoi-govardhan-puja",        label: "Govardhan Puja / Annakut",          subtitle: "Karthika Shukla Pratipada · gau-puja · niyam #19",         tradition: "Bishnoi" },
];

const HINDU_DEFAULTS        = ["ekadashi", "purnima", "pradosh"];
const JAIN_DEFAULTS         = ["paryushana", "navpad-oli", "samvatsari"];
const SIKH_DEFAULTS         = ["guru-nanak-gurpurab", "baisakhi-sikh", "sangrand"];
const BOTH_DEFAULTS         = ["ekadashi", "purnima", "pradosh", "paryushana", "navpad-oli"];
const SWAMINARAYAN_DEFAULTS = ["swaminarayan-jayanti", "fuldol-swaminarayan", "ekadashi-swaminarayan-jan-1", "pramukh-swami-jayanti-baps", "mahant-swami-jayanti-baps", "gunatitanand-swami-jayanti-baps", "baps-sthapana-din"];
const ISKCON_DEFAULTS       = ["iskcon-ekadashi", "janmashtami-iskcon", "gaura-purnima", "radhashtami", "narasimha-chaturdashi", "kartik-damodara", "nityananda-trayodashi", "ramanavami-iskcon", "ratha-yatra-iskcon", "balarama-purnima-iskcon", "vyasa-puja-iskcon", "govardhan-puja-iskcon", "srila-prabhupada-tirobhava-iskcon", "tulasi-vivaha-iskcon"];
const LINGAYAT_DEFAULTS     = ["maha-shivaratri-lingayat", "somavara-lingayat", "basava-jayanti"];
const PUSHTI_MARG_DEFAULTS  = ["ekadashi-pushti-marg", "janmashtami-pushti-marg", "annakut-pushti-marg", "phoolon-wali-holi"];
const WARKARI_DEFAULTS         = ["ashadhi-ekadashi-warkari", "kartiki-ekadashi-warkari", "tukaram-beej", "dnyaneshwar-punyatithi"];
const RAMANANDI_DEFAULTS       = [
  // Existing one-off Ramanandi festivals
  "ram-navami-ramanandi", "hanuman-jayanti-ramanandi", "sita-navami", "vivah-panchami", "tulsi-vivah-ramanandi",
  // Recurring fortnightly / monthly tithis
  "purnima-ramanandi", "ekadashi-ramanandi", "sankashti-chaturthi-ramanandi", "amavasya-ramanandi",
  // Major one-off festivals across the Vikram Samvat year (lunar order)
  "akshaya-tritiya-ramanandi", "ganga-dussehra-ramanandi", "ratha-yatra-ramanandi",
  "devshayani-ekadashi-ramanandi", "jhulan-yatra-ramanandi", "krishna-janmashtami-ramanandi",
  "annakut-ramanandi", "prabodhini-ekadashi-ramanandi",
  "makar-sankranti-ramanandi", "magha-mela-ramanandi", "vasant-panchami-ramanandi", "holi-ramanandi",
];
const SRIVAISHNAVA_DEFAULTS    = [
  "ekadashi-srivaishnava",
  "vaikuntha-ekadashi",
  "adhyayana-utsavam",
  "andal-tirunakshatram-srivaishnava",
  "nammazhwar-tirunakshatram-srivaishnava",
  "ramanuja-jayanti",
  "vedanta-desika-tirunakshatram-srivaishnava",
  "manavala-mamuni-tirunakshatram-srivaishnava",
  "nathamuni-tirunakshatram-srivaishnava",
  "yamunacharya-tirunakshatram-srivaishnava",
  "panguni-uthiram-srivaishnava",
  "garuda-sevai-srivaishnava",
  "hayagriva-jayanti-srivaishnava",
  "vamana-jayanti-srivaishnava",
  "pavitrotsavam",
  "brahmotsavam-srivaishnava",
];
const SHAKTA_DEFAULTS          = ["amavasya-shakta", "sharadiya-navaratri-shakta", "maha-ashtami-shakta", "lakshmi-puja-shakta", "kali-puja-shakta", "chaitra-navaratri-shakta", "phalaharini-kali-puja-shakta", "mahalaya-amavasya-shakta", "shakambhari-purnima-shakta", "magha-gupta-navaratri-shakta", "saraswati-puja-shakta", "lalita-jayanti-shakta", "ashadha-gupta-navaratri-shakta", "jagaddhatri-puja-shakta", "annapurna-jayanti-shakta"];
const SHAIVA_SIDDHANTA_DEFAULTS = ["maha-shivaratri-shaiva", "aarudra-darshan", "karthigai-deepam-shaiva", "skanda-shashti-shaiva"];
const BISHNOI_DEFAULTS          = ["guru-jambheshwar-jayanti", "khejarli-shaheed-diwas", "jambhoji-mukti-diwas", "mukam-mela-asoj-amavasya", "mukam-mela-phalgun-amavasya", "bishnoi-holi", "bishnoi-mauni-amavasya", "bishnoi-guru-purnima", "bishnoi-akshay-tritiya", "bishnoi-devshayani-ekadashi", "bishnoi-govardhan-puja"];

function defaultsForTradition(t: Tradition): string[] {
  if (t === "Hindu")            return HINDU_DEFAULTS;
  if (t === "Jain")             return JAIN_DEFAULTS;
  if (t === "Sikh")             return SIKH_DEFAULTS;
  if (t === "Swaminarayan")     return SWAMINARAYAN_DEFAULTS;
  if (t === "ISKCON")           return ISKCON_DEFAULTS;
  if (t === "Lingayat")         return LINGAYAT_DEFAULTS;
  if (t === "PushtiMarg")       return PUSHTI_MARG_DEFAULTS;
  if (t === "Warkari")          return WARKARI_DEFAULTS;
  if (t === "Ramanandi")        return RAMANANDI_DEFAULTS;
  if (t === "SriVaishnava")     return SRIVAISHNAVA_DEFAULTS;
  if (t === "Shakta")           return SHAKTA_DEFAULTS;
  if (t === "ShaivaSiddhanta")  return SHAIVA_SIDDHANTA_DEFAULTS;
  if (t === "Bishnoi")          return BISHNOI_DEFAULTS;
  return BOTH_DEFAULTS;
}

// ─── SVG Symbols ─────────────────────────────────────────────────────────────
function IskconLogoSvg({ className = "" }: { className?: string; style?: CSSProperties }) {
  return (
    <img src="/iskcon_logo.svg" className={className} alt="ISKCON" style={{ objectFit: "contain" }} />
  );
}

function LotusSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="24" rx="5" ry="14" opacity="0.9" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(28 30 42)" opacity="0.85" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(58 30 42)" opacity="0.75" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(-85 30 42)" opacity="0.6" />
      <ellipse cx="30" cy="24" rx="5" ry="14" transform="rotate(85 30 42)" opacity="0.6" />
      <circle cx="30" cy="42" r="7" />
    </svg>
  );
}

function OmSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor" aria-hidden="true">
      <text x="50%" y="75%" textAnchor="middle" fontSize="52" fontFamily="serif">ॐ</text>
    </svg>
  );
}

function TrisulaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 68" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="21" y="26" width="6" height="38" rx="3"/>
      <path d="M24 2 C24 2 20 10 20 18 L28 18 C28 10 24 2 24 2Z"/>
      <path d="M11 8 C9 13 9 20 13 23 L18 23 L18 18 C14 18 12 14 13 10Z"/>
      <path d="M37 8 C39 13 39 20 35 23 L30 23 L30 18 C34 18 36 14 35 10Z"/>
      <rect x="11" y="20" width="26" height="4" rx="2"/>
    </svg>
  );
}

function PeacockFeatherSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 72" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="22" y="34" width="4" height="36" rx="2"/>
      <ellipse cx="24" cy="18" rx="14" ry="20" opacity="0.2"/>
      <ellipse cx="24" cy="18" rx="10" ry="14"/>
      <ellipse cx="24" cy="18" rx="5" ry="7" fill="white" opacity="0.85"/>
      <ellipse cx="24" cy="18" rx="2.5" ry="3.5"/>
    </svg>
  );
}

function JainHandSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} fill="currentColor" aria-hidden="true">
      <path d="M30 78 C18 78 10 68 10 54 L10 26 C10 21.5 13.5 18 18 18 C20.5 18 22.5 19.2 24 21 L24 16 C24 11.5 27.5 8 32 8 C36.5 8 40 11.5 40 16 L40 18.5 C41.5 17 43.5 16 46 16 C50.5 16 54 19.5 54 24 L54 28 C55.5 26.5 57.5 25.5 60 25.5 C64.5 25.5 68 29 68 33.5 L68 54 C68 68 58 78 46 78 Z" transform="scale(0.7) translate(4, 2)" />
      <circle cx="30" cy="48" r="9" fill="white" />
      <path d="M25 48 L35 48 M30 43 L30 53" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function KhandaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 838" className={className} style={style} aria-hidden="true">
      <path d="M 382.877 20.123 C 369.559 30.822, 345.376 45.962, 330.750 52.758 L 324 55.895 324 60.716 C 324 63.367, 325.121 70.478, 326.491 76.518 C 330.918 96.036, 331.246 95.385, 314.461 100.337 C 256.870 117.327, 191.500 172.746, 164.465 227.500 C 128.787 299.759, 133.953 392.025, 177.399 458.500 C 205.721 501.836, 258.627 543.384, 305.275 558.925 C 319.415 563.636, 319.789 564.487, 315.501 582.186 C 311.341 599.359, 309.421 597.713, 335.145 599.034 C 362.888 600.459, 359.904 596.918, 363.140 632.263 C 364.614 648.366, 366.925 648.221, 339.819 633.723 C 252.035 586.770, 204.974 549.771, 163.695 495.259 C 67.338 368.009, 85.097 234.198, 213 123.764 C 234.742 104.992, 234.667 103.873, 212.041 109.559 C 110.139 135.170, 38.463 217.919, 19.001 332.424 C -3.183 462.948, 77.786 612.592, 213.874 692.578 C 223.306 698.122, 229.221 704.156, 231.270 710.324 C 233.906 718.262, 236.150 716.989, 261 693.454 C 278.715 676.677, 287.385 669.523, 297.935 662.980 L 306.023 657.964 315.262 664.154 C 330.925 674.649, 347.391 686.178, 349.711 688.277 C 352.765 691.038, 351.984 692.143, 339.263 703.039 C 313.054 725.490, 308.858 729.378, 303.067 736.577 C 282.832 761.731, 290.623 784.971, 319.300 784.994 C 330.385 785.004, 333.416 782.872, 342.754 768.500 C 346.597 762.584, 352.819 754.927, 357.990 749.750 C 373.817 733.904, 377.458 740.437, 362.850 758.470 C 333.229 795.033, 383.820 841.515, 416.786 808.026 C 431.330 793.250, 431.601 775.970, 417.578 757.500 C 411.168 749.057, 410 746.910, 410 743.566 C 410 734.605, 425.868 749.290, 441.223 772.463 C 451.449 787.894, 469.510 790.098, 482.357 777.483 C 498.744 761.393, 491.697 745.849, 452.882 712.466 C 432.026 694.528, 428.655 691.121, 430.072 689.413 C 430.659 688.706, 441.041 681.316, 453.142 672.992 L 475.144 657.858 482.035 661.952 C 491.830 667.771, 501.058 675.358, 520.523 693.600 C 544.940 716.481, 546.929 717.777, 549.146 712.250 C 553.075 702.455, 555.873 699.765, 573.512 688.823 C 660.606 634.799, 723.719 555.962, 752.815 464.849 C 802.830 308.231, 705.681 131.137, 556.250 106.524 C 547.729 105.121, 550.304 108.484, 571.500 126.448 C 654.376 196.686, 688.599 278.271, 674.504 372 C 661.836 456.236, 588.780 548.821, 488.500 607.724 C 467.194 620.239, 420.825 645, 418.695 645 C 417.216 645, 419.673 608.756, 421.553 602.832 C 422.335 600.370, 423.498 600.193, 446.302 599.048 C 471.150 597.801, 470.002 598.724, 466.055 583.167 C 461.173 563.920, 460.979 564.315, 478.486 557.960 C 610.741 509.951, 674.863 366.463, 621.629 237.646 C 598.393 181.420, 529.902 119.704, 470.500 101.468 C 453.923 96.379, 453.151 96.050, 452.427 93.771 C 452.076 92.664, 453.259 84.451, 455.056 75.521 C 458.967 56.086, 459.278 57.164, 448.152 51.576 C 432.526 43.728, 411.049 30.140, 398.803 20.352 C 390.615 13.808, 390.737 13.809, 382.877 20.123 M 329.723 164.487 C 173.505 220.082, 164.045 413.813, 313.840 489.732 C 335.376 500.647, 334.660 501.050, 339.953 475 C 353.029 410.637, 357.976 316.778, 352.180 243 C 345.822 162.064, 344.963 159.063, 329.723 164.487 M 438.720 164.138 C 433.355 172.743, 426.995 257.397, 427.010 320 C 427.027 389.999, 430.285 424.681, 441.616 475.500 C 447.333 501.142, 445.886 499.900, 461.500 492.567 C 615.210 420.383, 612.274 229.328, 456.490 166.524 C 444.255 161.592, 440.613 161.102, 438.720 164.138" fill="currentColor" fillRule="evenodd" stroke="none" />
    </svg>
  );
}

function BowArrowSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M14 6 C 32 18, 32 42, 14 54" />
      <line x1="14" y1="6" x2="14" y2="54" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="20" y1="30" x2="52" y2="30" />
      <polyline points="44,22 52,30 44,38" fill="none" />
      <polyline points="20,26 14,30 20,34" fill="none" strokeWidth="2" />
    </svg>
  );
}

// ─── Tradition-specific silhouette icons (Warkari, Ramanandi, SriVaishnava,
//     Shakta, ShaivaSiddhanta, PushtiMarg, Lingayat) ───────────────────────────

// Warkari: Vitthal standing on a brick at Pandharpur, hands on hips (akimbo).
function VitthalSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M22 4 L26 1 L30 4 L34 1 L38 4 L37 10 L23 10 Z" />
      <circle cx="30" cy="15" r="5" />
      <path d="M27 19 L33 19 L37 22 L44 26 L44 30 L40 31 L36 28 L36 40 L24 40 L24 28 L20 31 L16 30 L16 26 L23 22 Z" />
      <path d="M24 40 L36 40 L38 58 L22 58 Z" />
      <rect x="25" y="58" width="4" height="14" />
      <rect x="31" y="58" width="4" height="14" />
      <rect x="14" y="72" width="32" height="6" rx="1" />
    </svg>
  );
}

// Ramanandi: Urdhva Pundra — the canonical Vaishnav tilak worn by Ramanandi sadhus
// across Ayodhya, Chitrakoot, and Janakpur. The white "U" represents the
// lotus feet of Vishnu / Sri Ram; the central red vertical line (shrivatsa
// flame) represents Devi Sita / Lakshmi; the red bindu at the base
// represents the devotee's surrendered head at the Lord's feet.
function UrdhvaPundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 64" className={className} style={style} aria-hidden="true">
      <path
        d="M5 4 H17 V40 Q17 44 21 44 H27 Q31 44 31 40 V4 H43 V42 Q43 56 31 56 H17 Q5 56 5 42 Z"
        fill="white"
      />
      <path
        d="M24 3 Q19 18 21 32 Q22 40 24 46 Q26 40 27 32 Q29 18 24 3 Z"
        fill="#DC2626"
      />
      <circle cx="24" cy="60" r="3.4" fill="#DC2626" />
    </svg>
  );
}

function _CharanPadukaSvg_DEPRECATED({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <ellipse cx="18" cy="32" rx="9" ry="20" />
      <circle cx="18" cy="20" r="2.5" fill="white" />
      <circle cx="18" cy="20" r="1.2" />
      <ellipse cx="42" cy="32" rx="9" ry="20" />
      <circle cx="42" cy="20" r="2.5" fill="white" />
      <circle cx="42" cy="20" r="1.2" />
    </svg>
  );
}

// Sri Vaishnava: Naamam (Thiruman + Srichurnam) — the U-shape with central
// vertical stripe worn by Sri Vaishnavas. The defining sectarian mark of
// Srirangam, Tirumala, Ahobila Math, and Iyengar communities.
function NaamamSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="17" y1="6" x2="17" y2="55" stroke="currentColor" strokeWidth="6.5" />
      <line x1="43" y1="6" x2="43" y2="55" stroke="currentColor" strokeWidth="6.5" />
      <path d="M14 55 C14 74 46 74 46 55" stroke="currentColor" strokeWidth="6.5" />
      <line x1="30" y1="10" x2="30" y2="62" stroke="#DC2626" strokeWidth="6.5" />
    </svg>
  );
}

// Shakta: Sri Yantra — interlocking upward and downward triangles with the
// central bindu, the universal Shakta / Devi yantra.
function SriYantraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="30" cy="30" r="27" strokeWidth="1.5" />
      <polygon points="30,8 8,46 52,46" />
      <polygon points="30,52 8,14 52,14" />
      <polygon points="30,15 14,40 46,40" />
      <polygon points="30,45 14,20 46,20" />
      <circle cx="30" cy="30" r="2.5" fill="currentColor" />
    </svg>
  );
}

// Shaiva Siddhanta: Tripundra — three horizontal vibhuti stripes with the
// central bindi, the traditional Tamil Shaiva forehead mark.
function TripundraSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <rect x="6" y="18" width="48" height="4" rx="2" />
      <rect x="6" y="28" width="48" height="4" rx="2" />
      <rect x="6" y="38" width="48" height="4" rx="2" />
      <circle cx="30" cy="30" r="3" />
    </svg>
  );
}

// Pushti Marg: Shrinathji — small Krishna figure with left arm raised
// straight up to lift Govardhan hill. The presiding deity at Nathdwara.
function ShrinathjiSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M14 8 Q22 2 28 5 Q34 1 40 5 Q48 2 50 9 Q49 13 44 13 L18 13 Q12 13 14 8 Z" />
      <rect x="22" y="12" width="4" height="22" rx="2" />
      <path d="M28 26 L30 22 L32 25 L34 21 L36 25 L38 22 L40 26 Z" />
      <ellipse cx="34" cy="32" rx="5" ry="6" />
      <path d="M27 38 L41 38 L41 60 L27 60 Z" />
      <rect x="41" y="38" width="3.5" height="20" rx="1.5" />
      <path d="M25 60 L43 60 L46 76 L22 76 Z" />
    </svg>
  );
}

// Lingayat: Ishtalinga in a cupped palm — every Lingayat wears a personal
// spherical linga, and the cupped-palm worship gesture is iconic.
function IshtalingaSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      <circle cx="30" cy="28" r="14" />
      <ellipse cx="25" cy="22" rx="3.5" ry="2.5" fill="white" opacity="0.4" />
      <path d="M6 38 C6 50 16 56 30 56 C44 56 54 50 54 38 L50 38 C50 47 41 52 30 52 C19 52 10 47 10 38 Z" />
    </svg>
  );
}

// Bishnoi: Khejri tree (Prosopis cineraria) — the sacred desert tree of
// Marwar that Amrita Devi Bishnoi and 363 Bishnois sacrificed their lives
// to protect at Khejarli (1730 CE). Stylized desert tree with a sturdy
// trunk and a leafy crown rising from the dunes.
function KhejriTreeSvg({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden="true">
      {/* dunes */}
      <path d="M0 50 Q15 44 30 48 Q45 52 60 46 L60 60 L0 60 Z" opacity="0.45" />
      {/* trunk */}
      <path d="M28 50 L28 28 Q27 22 30 20 Q33 22 32 28 L32 50 Z" />
      {/* leafy crown — three rounded canopies */}
      <circle cx="30" cy="16" r="9" />
      <circle cx="20" cy="20" r="7" />
      <circle cx="40" cy="20" r="7" />
      <circle cx="24" cy="12" r="5" />
      <circle cx="36" cy="12" r="5" />
    </svg>
  );
}

function BothSymbol({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <OmSvg className="w-7 h-7 text-amber-700" />
      <JainHandSvg className="w-5 h-7 text-green-700" />
    </div>
  );
}

// ─── Diya illustration for final screen ───────────────────────────────────────
function DiyaSvg() {
  return (
    <svg viewBox="0 0 140 160" className="w-36 h-44 mx-auto" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="85" rx="55" ry="55" fill="url(#glow)" />
      <path d="M70 28 C60 42 57 60 66 70 C68 73 70 74 70 74 C70 74 72 73 74 70 C83 60 80 42 70 28 Z" fill="url(#flameGrad)" />
      <path d="M70 42 C65 52 64 63 68 70 C69 72 70 73 70 73 C70 73 71 72 72 70 C76 63 75 52 70 42 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M70 74 C74 80 80 86 86 90" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 102 Q36 128 70 130 Q104 128 108 102 Q104 94 70 91 Q36 94 32 102 Z" fill="#C2410C" />
      <path d="M97 94 Q108 88 116 90 Q118 98 107 102 Q102 98 97 94 Z" fill="#9A3412" />
      <ellipse cx="70" cy="102" rx="22" ry="6" fill="#92400E" opacity="0.5" />
      <ellipse cx="62" cy="99" rx="7" ry="2.5" fill="#FCD34D" opacity="0.3" transform="rotate(-10 62 99)" />
      <circle cx="50" cy="115" r="2.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="70" cy="122" r="2.5" fill="#FCD34D" opacity="0.6" />
      <circle cx="90" cy="115" r="2.5" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

// ─── Step indicator dots ──────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 justify-center mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? "#E07B2A" : "#E07B2A40",
          }}
        />
      ))}
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: on ? "#E07B2A" : "#D1D5DB" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Vrat row (used in Screen 3) ─────────────────────────────────────────────
function VratRow({
  opt,
  on,
  onToggle,
}: {
  opt: { id: string; label: string; subtitle: string };
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-foreground">{opt.label}</p>
        <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

// ─── Main Onboarding component ────────────────────────────────────────────────
export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [tradition, setTradition] = useState<Tradition>("Hindu");
  const [observed, setObserved] = useState<string[]>(HINDU_DEFAULTS);
  const [location, setLocationState] = useState<UserLocation>("india");
  const [region, setRegion] = useState<UserRegion>("all");
  const [city, setCity] = useState("");

  // When the user changes country, reset region to "All" so we never carry
  // an Indian region into a US/UK/AU context (or vice versa).
  function setLocation(next: UserLocation) {
    setLocationState(next);
    if (!isValidRegionForLocation(region, next)) {
      setRegion("all");
    }
  }

  const regionOptions = getRegionOptionsForLocation(location);
  const regionCopy = getRegionScreenCopy(location);

  const TOTAL_STEPS = 7;

  function chooseTradition(t: Tradition) {
    setTradition(t);
    setObserved(defaultsForTradition(t));
  }

  function toggleVrat(id: string) {
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function finish() {
    localStorage.setItem(TRADITION_KEY, tradition);
    localStorage.setItem(OBSERVED_KEY, JSON.stringify(observed));
    localStorage.setItem(CITY_KEY, city.trim());
    localStorage.setItem(LOCATION_KEY, location);
    localStorage.setItem(REGION_KEY, region);
    localStorage.setItem(ONBOARDING_KEY, "1");
    localStorage.setItem(DISCLAIMER_KEY, "1");
    onComplete();
  }

  const visibleVrats =
    tradition === "Hindu"            ? VRAT_OPTIONS.filter((v) => v.tradition === "Hindu") :
    tradition === "Jain"             ? VRAT_OPTIONS.filter((v) => v.tradition === "Jain") :
    tradition === "Sikh"             ? VRAT_OPTIONS.filter((v) => v.tradition === "Sikh") :
    tradition === "Swaminarayan"     ? VRAT_OPTIONS.filter((v) => v.tradition === "Swaminarayan") :
    tradition === "ISKCON"           ? VRAT_OPTIONS.filter((v) => v.tradition === "ISKCON") :
    tradition === "Lingayat"         ? VRAT_OPTIONS.filter((v) => v.tradition === "Lingayat") :
    tradition === "PushtiMarg"       ? VRAT_OPTIONS.filter((v) => v.tradition === "PushtiMarg") :
    tradition === "Warkari"          ? VRAT_OPTIONS.filter((v) => v.tradition === "Warkari") :
    tradition === "Ramanandi"        ? VRAT_OPTIONS.filter((v) => v.tradition === "Ramanandi") :
    tradition === "SriVaishnava"     ? VRAT_OPTIONS.filter((v) => v.tradition === "SriVaishnava") :
    tradition === "Shakta"           ? VRAT_OPTIONS.filter((v) => v.tradition === "Shakta") :
    tradition === "ShaivaSiddhanta"  ? VRAT_OPTIONS.filter((v) => v.tradition === "ShaivaSiddhanta") :
    tradition === "Bishnoi"          ? VRAT_OPTIONS.filter((v) => v.tradition === "Bishnoi") :
    VRAT_OPTIONS.filter((v) => v.tradition === "Hindu" || v.tradition === "Jain");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${TOTAL_STEPS * 100}%`, transform: `translateX(-${(step * 100) / TOTAL_STEPS}%)` }}
      >
        {/* ── Screen 1: Welcome ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col items-center justify-between px-6 pb-10 safe-top"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
        >
          <div />

          {/* Title */}
          <div className="text-center text-white w-full max-w-xs">
            <h1 className="font-serif text-6xl font-bold mb-2 tracking-tight" style={{ color: "#FEF9EC" }}>
              VRAT
            </h1>
            <p className="text-2xl font-serif font-semibold mb-1" style={{ color: "#FDE68A" }}>
              Your fast. Your way.
            </p>
            <p className="text-sm leading-relaxed mb-8 opacity-85" style={{ color: "#FEF3E2" }}>
              Tap your tradition to begin
            </p>

            {/* ── Tradition selector cards ──
                Order: Hindu/Jain/Sikh on top (the three umbrella categories),
                then the remaining 9 sub-traditions alphabetically. ── */}
            <div className="flex flex-col gap-3 w-full">
              {/* Top row: Hindu, Jain, Sikh — compact icon buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { chooseTradition("Hindu"); setStep(2); }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
                >
                  <OmSvg className="w-12 h-12 text-amber-100" />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Hindu</span>
                </button>

                <button
                  onClick={() => { chooseTradition("Jain"); setStep(2); }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
                >
                  <JainHandSvg className="w-9 h-12 text-amber-100" />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Jain</span>
                </button>

                <button
                  onClick={() => { chooseTradition("Sikh"); setStep(2); }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 px-2 transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
                >
                  <KhandaSvg className="w-12 h-12" style={{ color: "#7EC8F0" }} />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: "#FEF9EC" }}>Sikh</span>
                </button>
              </div>

              {/* Bishnoi */}
              <button
                onClick={() => { chooseTradition("Bishnoi"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <KhejriTreeSvg className="w-10 h-10" style={{ color: "#86EFAC" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Bishnoi (Jambhoji panth)</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>विष्णो विष्णो · 29 niyams · Mukam · Khejarli</span>
                </div>
              </button>

              {/* ISKCON */}
              <button
                onClick={() => { chooseTradition("ISKCON"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <IskconLogoSvg className="w-7 h-10" />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>ISKCON / Vaishnava</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>Hare Krishna · Ekadashi · Gaura Purnima</span>
                </div>
              </button>

              {/* Lingayat */}
              <button
                onClick={() => { chooseTradition("Lingayat"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <IshtalingaSvg className="w-10 h-10" style={{ color: "#FECDD3" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Lingayat / Veerashaiva</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>ಓಂ ನಮಃ ಶಿವಾಯ · Shivaratri · Basava Jayanti</span>
                </div>
              </button>

              {/* Pushti Marg */}
              <button
                onClick={() => { chooseTradition("PushtiMarg"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <ShrinathjiSvg className="w-8 h-11" style={{ color: "#A5F3FC" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Pushti Marg / Vallabha Sampraday</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>श्री नाथजी · Janmashtami · Annakut · Hindola Utsav</span>
                </div>
              </button>

              {/* Ramanandi */}
              <button
                onClick={() => { chooseTradition("Ramanandi"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <UrdhvaPundraSvg className="w-10 h-10" />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Ramanandi Sampraday</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>सीताराम · Ram Navami · Hanuman Jayanti · Ayodhya</span>
                </div>
              </button>

              {/* Shaiva Siddhanta */}
              <button
                onClick={() => { chooseTradition("ShaivaSiddhanta"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <TripundraSvg className="w-10 h-10" style={{ color: "#E5E7EB" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Shaiva Siddhanta (Tamil Shaiva)</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>ஓம் நமச்சிவாய · Nataraja · Aarudra · Karthigai · Skanda Shashti</span>
                </div>
              </button>

              {/* Shakta */}
              <button
                onClick={() => { chooseTradition("Shakta"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <SriYantraSvg className="w-10 h-10" style={{ color: "#FBCFE8" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Shakta (Devi worship)</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>दुर्गा काली · Bengali Durga Puja · Kali Puja · Navaratri</span>
                </div>
              </button>

              {/* Sri Vaishnava */}
              <button
                onClick={() => { chooseTradition("SriVaishnava"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <NaamamSvg className="w-8 h-11" style={{ color: "#FDE68A" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Sri Vaishnava (Iyengar)</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>ஓம் நமோ நாராயணாய · Vaikuntha Ekadashi · Ramanuja · Srirangam</span>
                </div>
              </button>

              {/* Swaminarayan */}
              <button
                onClick={() => { chooseTradition("Swaminarayan"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <LotusSvg className="w-10 h-10" style={{ color: "#F4D58D" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Swaminarayan</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>स्वामिनारायण · Jayanti · Fuldol · Annakut · strict Ekadashi</span>
                </div>
              </button>

              {/* Warkari */}
              <button
                onClick={() => { chooseTradition("Warkari"); setStep(2); }}
                className="flex flex-row items-center justify-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)" }}
              >
                <VitthalSvg className="w-8 h-11" style={{ color: "#FED7AA" }} />
                <div className="text-left">
                  <span className="text-xs font-semibold tracking-wide block" style={{ color: "#FEF9EC" }}>Warkari (Vitthal-Vithoba)</span>
                  <span className="text-xs opacity-70" style={{ color: "#FDE68A" }}>विठ्ठल · Pandharpur Wari · Tukaram Beej · Dnyaneshwar</span>
                </div>
              </button>
            </div>

          </div>

          <StepDots total={TOTAL_STEPS} current={0} />
        </div>

        {/* ── Screen 2: Tradition ──────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 1 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Which tradition do you follow?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              We'll personalise your calendar and vrat guidance accordingly.
            </p>

            <div className="space-y-3">
              {(
                // Order: Hindu / Jain / Sikh first (umbrella categories),
                // then the remaining 9 sub-traditions alphabetically.
                [
                  {
                    value: "Hindu" as Tradition,
                    label: "Hindu",
                    subtitle: "Ekadashi, Navratri, Karva Chauth and more",
                    icon: <OmSvg className="w-12 h-12 text-amber-600" />,
                    accent: "#E07B2A",
                  },
                  {
                    value: "Jain" as Tradition,
                    label: "Jain",
                    subtitle: "Paryushana, Navpad Oli, Samvatsari and more",
                    icon: <JainHandSvg className="w-9 h-12 text-green-600" />,
                    accent: "#22C55E",
                  },
                  {
                    value: "Sikh" as Tradition,
                    label: "Sikh",
                    subtitle: "Gurpurabs, Baisakhi, Sangrand and more",
                    icon: <KhandaSvg className="w-12 h-12" style={{ color: "#003DA5" }} />,
                    accent: "#003DA5",
                  },
                  {
                    value: "Bishnoi" as Tradition,
                    label: "Bishnoi (Jambhoji panth)",
                    subtitle: "Guru Jambheshwar Jayanti, Khejarli Shaheed Diwas, Mukam Mela",
                    icon: <KhejriTreeSvg className="w-12 h-12" style={{ color: "#16A34A" }} />,
                    accent: "#16A34A",
                  },
                  {
                    value: "ISKCON" as Tradition,
                    label: "ISKCON / Vaishnava",
                    subtitle: "Ekadashi (no grains), Gaura Purnima, Janmashtami, Kartik",
                    icon: <IskconLogoSvg className="w-10 h-14" />,
                    accent: "#0284C7",
                  },
                  {
                    value: "Lingayat" as Tradition,
                    label: "Lingayat / Veerashaiva",
                    subtitle: "Maha Shivaratri, Shravana Somavara, Basava Jayanti",
                    icon: <IshtalingaSvg className="w-12 h-12" style={{ color: "#9B2335" }} />,
                    accent: "#9B2335",
                  },
                  {
                    value: "PushtiMarg" as Tradition,
                    label: "Pushti Marg / Vallabha Sampraday",
                    subtitle: "Ekadashi (seva-based), Janmashtami, Annakut, Hindola Utsav",
                    icon: <ShrinathjiSvg className="w-9 h-12" style={{ color: "#0E7490" }} />,
                    accent: "#0E7490",
                  },
                  {
                    value: "Ramanandi" as Tradition,
                    label: "Ramanandi Sampraday",
                    subtitle: "Ram Navami, Hanuman Jayanti, Sita Navami, Tulsi Vivah",
                    icon: <UrdhvaPundraSvg className="w-12 h-12" />,
                    accent: "#B91C1C",
                  },
                  {
                    value: "ShaivaSiddhanta" as Tradition,
                    label: "Shaiva Siddhanta (Tamil Shaiva)",
                    subtitle: "Maha Shivaratri, Pradosha, Aarudra Darshan, Karthigai Deepam, Skanda Shashti",
                    icon: <TripundraSvg className="w-12 h-12" style={{ color: "#475569" }} />,
                    accent: "#475569",
                  },
                  {
                    value: "Shakta" as Tradition,
                    label: "Shakta (Devi worship)",
                    subtitle: "Sharadiya & Chaitra Navaratri, Durga Ashtami, Kali Puja, Lakshmi Puja",
                    icon: <SriYantraSvg className="w-12 h-12" style={{ color: "#BE185D" }} />,
                    accent: "#BE185D",
                  },
                  {
                    value: "SriVaishnava" as Tradition,
                    label: "Sri Vaishnava (Iyengar)",
                    subtitle: "Vaikuntha Ekadashi, Ramanuja Jayanti, Brahmotsavam, Adhyayana Utsavam",
                    icon: <NaamamSvg className="w-9 h-12" style={{ color: "#B45309" }} />,
                    accent: "#B45309",
                  },
                  {
                    value: "Swaminarayan" as Tradition,
                    label: "Swaminarayan",
                    subtitle: "Jayanti, Fuldol, Annakut and strict Ekadashi",
                    icon: <LotusSvg className="w-12 h-12" style={{ color: "#C4972A" }} />,
                    accent: "#C4972A",
                  },
                  {
                    value: "Warkari" as Tradition,
                    label: "Warkari (Vitthal-Vithoba)",
                    subtitle: "Pandharpur Wari, Tukaram Beej, Dnyaneshwar Punyatithi",
                    icon: <VitthalSvg className="w-9 h-12" style={{ color: "#DC6803" }} />,
                    accent: "#DC6803",
                  },
                ] as const
              ).map((opt) => {
                const selected = tradition === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => chooseTradition(opt.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? opt.accent : "#E5E7EB"}`,
                      background: selected ? `${opt.accent}12` : "white",
                    }}
                  >
                    <div className="w-14 flex items-center justify-center flex-shrink-0">
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                    </div>
                    {selected && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: opt.accent }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={1} />
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 3: Vrat toggles ───────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="px-6 pb-3 safe-top">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 2 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-1">Which vrats do you observe?</h2>
            <p className="text-sm text-muted-foreground">
              Toggle on the ones you keep. Your personal vrats will be starred in the calendar.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {visibleVrats.map((opt) => (
              <VratRow key={opt.id} opt={opt} on={observed.includes(opt.id)} onToggle={() => toggleVrat(opt.id)} />
            ))}
            <div className="h-4" />
          </div>

          <div className="px-6 pb-10">
            <StepDots total={TOTAL_STEPS} current={2} />
            <button
              onClick={() => setStep(3)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 4: Location ───────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 3 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Where are you based?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Panchang dates are rooted in IST. We'll show you a regional note so you can confirm with your local pandit.
            </p>

            <div className="space-y-3">
              {LOCATION_OPTIONS.map((opt) => {
                const selected = location === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setLocation(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? "#E07B2A" : "#E5E7EB"}`,
                      background: selected ? "#E07B2A12" : "white",
                    }}
                    data-testid={`location-option-${opt.id}`}
                  >
                    <span className="text-3xl flex-shrink-0" aria-hidden="true">{opt.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.timezone}</p>
                    </div>
                    {selected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#E07B2A" }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={3} />
            <button
              onClick={() => setStep(4)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 5: Region ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 4 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">{regionCopy.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {regionCopy.body}
            </p>

            <div className="space-y-2">
              {regionOptions.map((opt) => {
                const selected = region === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRegion(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-98"
                    style={{
                      border: `2px solid ${selected ? "#E07B2A" : "#E5E7EB"}`,
                      background: selected ? "#E07B2A12" : "white",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    </div>
                    {selected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#E07B2A" }}
                      >
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={4} />
            <button
              onClick={() => setStep(5)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* ── Screen 6: City ───────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 5 of 5</p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">What is your city?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              We use this to calculate Brahma Muhurta and moonrise times accurately for your location.
            </p>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Delhi, New York..."
              className="w-full px-4 py-4 rounded-2xl text-base border-2 outline-none transition-all bg-white"
              style={{
                borderColor: city ? "#E07B2A" : "#E5E7EB",
                color: "#1C1917",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#E07B2A")}
              onBlur={(e) => (e.target.style.borderColor = city ? "#E07B2A" : "#E5E7EB")}
              autoComplete="off"
            />

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-800 leading-relaxed">
                We use this only to calculate sunrise and moonrise times for you. We never store or share your location.
              </p>
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <StepDots total={TOTAL_STEPS} current={5} />
            <button
              onClick={() => setStep(6)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              {city.trim() ? "Next" : "Skip for now"}
            </button>
          </div>
        </div>

        {/* ── Screen 6: All set ────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col items-center justify-between px-6 pb-14 safe-top"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #C86B1A 0%, #E07B2A 50%, #D97706 100%)" }}
        >
          <div />
          <div className="text-center text-white w-full max-w-xs">
            <DiyaSvg />
            <h2 className="font-serif text-4xl font-bold mt-6 mb-2" style={{ color: "#FEF9EC" }}>
              You are all set.
            </h2>
            <p className="text-2xl font-serif font-semibold mb-4" style={{ color: "#FDE68A" }}>
              {tradition === "Sikh"
                ? "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh."
                : tradition === "Jain"
                ? "Jai Jinendra."
                : "Jai Mata Di."}
            </p>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: "#FEF3E2" }}>
              Your personal vrat calendar is ready.{" "}
              {`Showing ${tradition} vrats.`}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <button
              onClick={finish}
              className="w-full py-4 rounded-2xl font-semibold text-base tracking-wide transition-opacity active:opacity-80"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FEF9EC", border: "1.5px solid rgba(255,255,255,0.4)" }}
            >
              Enter VRAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

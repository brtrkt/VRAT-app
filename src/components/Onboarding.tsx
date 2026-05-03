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
import { TraditionIcon, TraditionSwitcher } from "@/components/TraditionSelector";

const DISCLAIMER_KEY = "vrat_disclaimer_accepted";

interface Props {
  onComplete: () => void;
}

// ─── Vrat catalogue for Screen 3 ────────────────────────────────────────────
const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" | "Warkari" | "Ramanandi" | "SriVaishnava" | "Shakta" | "ShaivaSiddhanta" | "Bishnoi" | "AryaSamaj" }[] = [
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
  { id: "pooranmashi",                  label: "Pooranmashi",                        subtitle: "Full moon of each month · 22 days/yr · gurdwara sangat",  tradition: "Sikh" },
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

  { id: "hari-path-warkari",          label: "Hari Path (हरि पाठ)",                subtitle: "Daily morning & evening · 28 abhangs of Sant Dnyaneshwar in praise of Vitthal · हरि पाठ — विठोबाचे नाम घ्या, सर्व पापे जळतील", tradition: "Warkari" },
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
  { id: "thai-poosam-shaiva",         label: "Thai Poosam (Thaipusam)",            subtitle: "Pushya nakshatra in Thai · kavadi-attam at Palani",        tradition: "ShaivaSiddhanta" },
  { id: "aadi-krittikai-shaiva",      label: "Aadi Krittikai",                     subtitle: "Krittika nakshatra in Aadi · Murugan at Tiruttani",        tradition: "ShaivaSiddhanta" },
  { id: "ugadi-telugu",               label: "Ugadi (Telugu New Year)",            subtitle: "Chaitra Shukla Pratipada · 6-taste Pachadi · Andhra/Telangana", tradition: "ShaivaSiddhanta" },
  { id: "vara-lakshmi-vratam",        label: "Varalakshmi Vratam",                 subtitle: "Friday before Shravana Purnima · 9-knot toram · married women", tradition: "ShaivaSiddhanta" },
  { id: "dasara-vijayadashami-telugu",label: "Dasara (Vijayadashami)",             subtitle: "Bommala koluvu · Ayudha Pooja · jammi-leaf exchange",      tradition: "ShaivaSiddhanta" },
  { id: "sankranti-telugu",           label: "Sankranti (Pedda Panduga)",          subtitle: "Jan 14 · 4-day harvest · Bhogi/Sankranti/Kanuma/Mukkanuma", tradition: "ShaivaSiddhanta" },
  { id: "kartika-masam-telugu",       label: "Kartika Masam (Karthika Pournami)",  subtitle: "Month-long akasa-deepam · 365 deepams on Kartika Pournami", tradition: "ShaivaSiddhanta" },
  { id: "pournami-telugu",            label: "Pournami (Full Moon Vratam)",        subtitle: "Every full-moon · ekabhuktam fast · arghya to Chandra · family-deity puja", tradition: "ShaivaSiddhanta" },

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
  { id: "bishnoi-hariyali-amavasya"           , label: "Hariyali Amavasya (Tree-Planting)"          , subtitle: "Shravana amavasya · vraksh-ropan · niyams 16-17"                  , tradition: "Bishnoi" },
  { id: "bishnoi-hariyali-teej"               , label: "Hariyali Teej"                              , subtitle: "Shravana Shukla Tritiya · Marwari women · monsoon"                , tradition: "Bishnoi" },
  { id: "bishnoi-vat-savitri-amavasya"        , label: "Vat Savitri Amavasya"                       , subtitle: "Jyeshtha amavasya · banyan worship · married women"               , tradition: "Bishnoi" },
  { id: "bishnoi-diwali-lakshmi-puja"         , label: "Diwali / Lakshmi Puja (No Crackers)"        , subtitle: "Karthika amavasya · ghee diyas · niyams 6-7"                      , tradition: "Bishnoi" },
  { id: "bishnoi-devuthani-ekadashi"          , label: "Devuthani Ekadashi (Chaturmas Ends)"        , subtitle: "Karthika Shukla Ekadashi · Vishnu wakes"                          , tradition: "Bishnoi" },
  { id: "bishnoi-tulsi-vivah"                 , label: "Tulsi Vivah"                                , subtitle: "Karthika Shukla Dwadashi · tulsi-shaligram wedding"               , tradition: "Bishnoi" },
  { id: "bishnoi-karthika-purnima"            , label: "Karthika Purnima / Dev Diwali"              , subtitle: "Karthika Purnima · snan · ghee diyas"                             , tradition: "Bishnoi" },
  { id: "bishnoi-nirjala-ekadashi"            , label: "Nirjala Ekadashi (Bhima Ekadashi)"          , subtitle: "Jyeshtha Shukla Ekadashi · 24-hr dry fast"                        , tradition: "Bishnoi" },
  { id: "bishnoi-maha-shivaratri"             , label: "Maha Shivaratri (Bishnoi)"                  , subtitle: "Magha Krishna Chaturdashi · all-night jagran"                     , tradition: "Bishnoi" },
  { id: "bishnoi-vasant-panchami"             , label: "Vasant Panchami / Saraswati Puja"           , subtitle: "Magha Shukla Panchami · akshar-abhyasam"                          , tradition: "Bishnoi" },
  { id: "bishnoi-ram-navami"                  , label: "Ram Navami"                                 , subtitle: "Chaitra Shukla Navami · Sri Ram's appearance"                     , tradition: "Bishnoi" },
  { id: "bishnoi-hanuman-jayanti"             , label: "Hanuman Jayanti"                            , subtitle: "Chaitra Purnima · Hanuman Chalisa · Sundara Kand"                 , tradition: "Bishnoi" },
  { id: "bishnoi-makar-sankranti"             , label: "Makar Sankranti / Uttarayan"                , subtitle: "Jan 14 · Surya arghya · til-laddu · no manjha"                    , tradition: "Bishnoi" },
  { id: "bishnoi-jajiwal-dham-mela"           , label: "Jajiwal Dham Mela"                          , subtitle: "Karthik Shukla Ashtami · Jodhpur · 14-mandir lineage"             , tradition: "Bishnoi" },

  { id: "arya-samaj-sthapana-diwas",       label: "Arya Samaj Sthapana Diwas",          subtitle: "Apr 10 · founding day · Mumbai 1875 · Dayananda Saraswati",      tradition: "AryaSamaj" },
  { id: "dayananda-saraswati-jayanti",     label: "Dayananda Saraswati Jayanti",        subtitle: "Phalguna Krishna Dashami · birth at Tankara, Gujarat (1824)",     tradition: "AryaSamaj" },
  { id: "dayananda-nirvana-diwas",         label: "Dayananda Nirvana Diwas",            subtitle: "Karthika Krishna Amavasya (Diwali) · mahaprayan Ajmer 1883",      tradition: "AryaSamaj" },
  { id: "vasanta-navsamvatsar-arya",       label: "Vasanta Navsamvatsar (Vedic New Year)", subtitle: "Chaitra Shukla Pratipada · Sristi Diwas · Vikram Samvat",      tradition: "AryaSamaj" },
  { id: "veda-prakatya-diwas",             label: "Veda Prakatya Diwas",                subtitle: "Ashadh Shukla Purnima · revelation of the four Vedas",            tradition: "AryaSamaj" },
  { id: "gayatri-jayanti-arya",            label: "Gayatri Jayanti",                    subtitle: "Jyeshtha Shukla Ekadashi · manifestation of Gayatri mantra",      tradition: "AryaSamaj" },
  { id: "virjananda-jayanti-arya",         label: "Swami Virjananda Jayanti",           subtitle: "Phalguna Krishna Tritiya · Dayananda's guru (Mathura)",           tradition: "AryaSamaj" },
  { id: "maharshi-bodh-diwas",             label: "Maharshi Bodh Diwas (Shivratri Bodh)", subtitle: "Maha Shivaratri · 14yo Mool Shankar's awakening (1839)",      tradition: "AryaSamaj" },
  { id: "holika-dahan-yajna-arya",         label: "Holika Dahan Yajna",                 subtitle: "Phalguna Purnima eve · cleansing yajna (no waste burning)",       tradition: "AryaSamaj" },
  { id: "vasant-panchami-arya",            label: "Vasant Panchami (Vedic Saraswati)",  subtitle: "Magha Shukla Panchami · Veda-vani · vidyarambha",                 tradition: "AryaSamaj" },
  { id: "shravani-upakarma-arya",          label: "Shravani Upakarma",                  subtitle: "Shravana Purnima · yagnopavit dharan · Veda-paath upakarma",      tradition: "AryaSamaj" },
  { id: "ram-navami-arya",                 label: "Ram Navami (Vedic Maryada)",         subtitle: "Chaitra Shukla Navami · Sri Ram as Vedic Maryada Purushottam",    tradition: "AryaSamaj" },
  { id: "krishna-janmashtami-arya",        label: "Krishna Janmashtami (Vedic Yogi)",   subtitle: "Bhadrapada Krishna Ashtami · Sri Krishna as Vedic Yogeshwara",    tradition: "AryaSamaj" },
];

const HINDU_DEFAULTS        = ["ekadashi", "purnima", "pradosh"];
const JAIN_DEFAULTS         = ["paryushana", "navpad-oli", "samvatsari"];
const SIKH_DEFAULTS         = ["guru-nanak-gurpurab", "baisakhi-sikh", "sangrand", "pooranmashi"];
const BOTH_DEFAULTS         = ["ekadashi", "purnima", "pradosh", "paryushana", "navpad-oli"];
const SWAMINARAYAN_DEFAULTS = ["swaminarayan-jayanti", "fuldol-swaminarayan", "ekadashi-swaminarayan-jan-1", "pramukh-swami-jayanti-baps", "mahant-swami-jayanti-baps", "gunatitanand-swami-jayanti-baps", "baps-sthapana-din"];
const ISKCON_DEFAULTS       = ["iskcon-ekadashi", "janmashtami-iskcon", "gaura-purnima", "radhashtami", "narasimha-chaturdashi", "kartik-damodara", "nityananda-trayodashi", "ramanavami-iskcon", "ratha-yatra-iskcon", "balarama-purnima-iskcon", "vyasa-puja-iskcon", "govardhan-puja-iskcon", "srila-prabhupada-tirobhava-iskcon", "tulasi-vivaha-iskcon"];
const LINGAYAT_DEFAULTS     = ["maha-shivaratri-lingayat", "somavara-lingayat", "basava-jayanti"];
const PUSHTI_MARG_DEFAULTS  = ["ekadashi-pushti-marg", "janmashtami-pushti-marg", "annakut-pushti-marg", "phoolon-wali-holi"];
const WARKARI_DEFAULTS         = ["hari-path-warkari", "ashadhi-ekadashi-warkari", "kartiki-ekadashi-warkari", "tukaram-beej", "dnyaneshwar-punyatithi"];
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
const SHAIVA_SIDDHANTA_DEFAULTS = ["maha-shivaratri-shaiva", "pradosha-shaiva", "aarudra-darshan", "karthigai-deepam-shaiva", "skanda-shashti-shaiva", "thai-poosam-shaiva", "aadi-krittikai-shaiva", "ugadi-telugu", "vara-lakshmi-vratam", "dasara-vijayadashami-telugu", "sankranti-telugu", "kartika-masam-telugu", "pournami-telugu"];
const BISHNOI_DEFAULTS          = ["guru-jambheshwar-jayanti", "khejarli-shaheed-diwas", "jambhoji-mukti-diwas", "mukam-mela-asoj-amavasya", "mukam-mela-phalgun-amavasya", "bishnoi-holi", "bishnoi-mauni-amavasya", "bishnoi-guru-purnima", "bishnoi-akshay-tritiya", "bishnoi-devshayani-ekadashi", "bishnoi-govardhan-puja", "bishnoi-hariyali-amavasya", "bishnoi-hariyali-teej", "bishnoi-vat-savitri-amavasya", "bishnoi-diwali-lakshmi-puja", "bishnoi-devuthani-ekadashi", "bishnoi-tulsi-vivah", "bishnoi-karthika-purnima", "bishnoi-nirjala-ekadashi", "bishnoi-maha-shivaratri", "bishnoi-vasant-panchami", "bishnoi-ram-navami", "bishnoi-hanuman-jayanti", "bishnoi-makar-sankranti", "bishnoi-jajiwal-dham-mela"];
const ARYA_SAMAJ_DEFAULTS       = ["arya-samaj-sthapana-diwas", "dayananda-saraswati-jayanti", "dayananda-nirvana-diwas", "vasanta-navsamvatsar-arya", "veda-prakatya-diwas", "gayatri-jayanti-arya", "virjananda-jayanti-arya", "maharshi-bodh-diwas", "holika-dahan-yajna-arya", "vasant-panchami-arya", "shravani-upakarma-arya", "ram-navami-arya", "krishna-janmashtami-arya"];

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
  if (t === "AryaSamaj")        return ARYA_SAMAJ_DEFAULTS;
  return BOTH_DEFAULTS;
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

  const TOTAL_STEPS = 6;

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

            {/* ── Tradition selector ──
                Shared icon + dropdown so onboarding mirrors the home screen
                exactly. Tap the pill to choose, then tap Begin. ── */}
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-end justify-center gap-4 min-h-[64px]">
                <TraditionIcon tradition={tradition} />
              </div>
              <TraditionSwitcher
                current={tradition}
                onSelect={(t) => chooseTradition(t)}
              />
              <button
                onClick={() => setStep(2)}
                className="mt-2 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
                style={{ background: "linear-gradient(135deg, #C86B1A 0%, #A8521B 100%)" }}
              >
                Begin
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

            {/* Shared icon + dropdown — same UI as Home so users see no
                visual difference between picking a tradition here and
                changing it later from the home screen. */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-end justify-center gap-4 min-h-[80px]">
                <TraditionIcon tradition={tradition} />
              </div>
              <TraditionSwitcher
                current={tradition}
                onSelect={(t) => chooseTradition(t)}
              />
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

        {/* ── Screen 3: Location ───────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 2 of 4</p>
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

        {/* ── Screen 4: Region ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 3 of 4</p>
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

        {/* ── Screen 5: City ───────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-full flex flex-col px-6 pb-12 safe-top overflow-y-auto"
          style={{ width: `${100 / TOTAL_STEPS}%`, background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}
        >
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-2">Step 4 of 4</p>
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
            <StepDots total={TOTAL_STEPS} current={4} />
            <button
              onClick={() => setStep(5)}
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              {city.trim() ? "Next" : "Skip for now"}
            </button>
          </div>
        </div>

        {/* ── Screen 6: All set ─────────────────────────────────
            Index in slider is now 5 since the Vrat-toggles screen has
            been removed and steps were renumbered to 4 total. ── */}
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

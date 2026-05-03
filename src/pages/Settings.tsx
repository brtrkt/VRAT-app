import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TRADITION_KEY,
  OBSERVED_KEY,
  CITY_KEY,
  LOCATION_KEY,
  REGION_KEY,
  ONBOARDING_KEY,
  LOCATION_OPTIONS,
  getRegionOptionsForLocation,
  getRegionScreenCopy,
  isValidRegionForLocation,
  type Tradition,
  type UserLocation,
  type UserRegion,
  getUserTradition,
  getObservedVrats,
  getUserCity,
  getUserLocation,
  getUserRegion,
  isVratObserved,
  isSubscribed,
  getDaysRemaining,
  isTrialExpired,
  getUserEmail,
  setUserEmail,
  setSubscribed,
} from "@/hooks/useUserPrefs";
import { detectCurrency, type Currency } from "@/utils/currencyDetect";
import PageFooter from "@/components/PageFooter";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const PRICES = {
  monthly:  { usd: "$2.99/month",  inr: "₹249/month"  },
  annual:   { usd: "$19.99/year",  inr: "₹1,699/year" },
  lifetime: { usd: "$49.99",       inr: "₹3,999"      },
} as const;

const VRAT_OPTIONS: { id: string; label: string; subtitle: string; tradition: "Hindu" | "Jain" | "Sikh" | "Swaminarayan" | "ISKCON" | "Lingayat" | "PushtiMarg" | "Warkari" | "Ramanandi" | "SriVaishnava" | "Shakta" | "ShaivaSiddhanta" | "Bishnoi" | "AryaSamaj" }[] = [
  { id: "ekadashi",                   label: "Ekadashi",                       subtitle: "24 days a year",                           tradition: "Hindu" },
  { id: "purnima",                    label: "Purnima",                        subtitle: "Full moon · 12 days a year",               tradition: "Hindu" },
  { id: "pradosh",                    label: "Pradosh / Pradosham",            subtitle: "For Lord Shiva · 24 days a year",          tradition: "Hindu" },
  { id: "amavasya",                   label: "Amavasya",                       subtitle: "New moon · 12 days a year",                tradition: "Hindu" },
  { id: "sankashti",                  label: "Sankashti Chaturthi",            subtitle: "For Lord Ganesha · 12 days a year",        tradition: "Hindu" },
  { id: "maha-shivratri",             label: "Maha Shivratri",                 subtitle: "The great night of Shiva",                 tradition: "Hindu" },
  { id: "navratri",                   label: "Navratri",                       subtitle: "Nine nights of Durga · twice a year",      tradition: "Hindu" },
  { id: "janmashtami",                label: "Janmashtami",                    subtitle: "Birth of Lord Krishna",                    tradition: "Hindu" },
  { id: "ram-navami",                 label: "Ram Navami",                     subtitle: "Birth of Lord Ram",                        tradition: "Hindu" },
  { id: "hanuman-jayanti",            label: "Hanuman Jayanti",                subtitle: "Hanuman ji",                               tradition: "Hindu" },
  { id: "ganesh-chaturthi",           label: "Ganesh Chaturthi",               subtitle: "Birth of Lord Ganesha",                   tradition: "Hindu" },
  { id: "diwali",                     label: "Deepawali / Lakshmi Puja",          subtitle: "Festival of lights",                      tradition: "Hindu" },
  { id: "karva-chauth",               label: "Karva Chauth",                   subtitle: "For a husband's long life",               tradition: "Hindu" },
  { id: "hartalika-teej",             label: "Hartalika Teej",                 subtitle: "For Lord Shiva and Parvati",              tradition: "Hindu" },
  { id: "hariyali-teej",              label: "Hariyali Teej",                  subtitle: "Monsoon celebration of Parvati",          tradition: "Hindu" },
  { id: "vat-savitri",                label: "Vat Savitri",                    subtitle: "For a husband's longevity",               tradition: "Hindu" },
  { id: "ahoi-ashtami",               label: "Ahoi Ashtami",                   subtitle: "For children's wellbeing",                tradition: "Hindu" },
  { id: "chhath-puja",                label: "Chhath Puja",                    subtitle: "For the Sun God · 36-hour strict fast",   tradition: "Hindu" },
  { id: "akshaya-tritiya",            label: "Akshaya Tritiya",                subtitle: "The auspicious third",                    tradition: "Hindu" },
  { id: "mahavir-jayanti",            label: "Mahavir Jayanti",                subtitle: "Birth of Lord Mahavira",                  tradition: "Jain"  },
  { id: "paryushana",                 label: "Paryushana",                     subtitle: "Eight days of reflection and fasting",    tradition: "Jain"  },
  { id: "samvatsari",                 label: "Samvatsari Pratikraman",         subtitle: "Annual day of forgiveness",               tradition: "Jain"  },
  { id: "navpad-oli",                 label: "Navpad Oli",                     subtitle: "Nine days of austerity · twice a year",   tradition: "Jain"  },
  { id: "das-lakshana",               label: "Das Lakshana Parva",             subtitle: "Ten days of dharma",                      tradition: "Jain"  },
  { id: "mahavira-nirvana",           label: "Mahavira Nirvana",               subtitle: "Jain Deepawali · day of liberation",         tradition: "Jain"  },
  { id: "guru-gobind-singh-gurpurab",    label: "Guru Gobind Singh Ji Gurpurab",      subtitle: "Poh 7 (Jan 6) · 10th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "maghi",                         label: "Maghi",                              subtitle: "Magh 1 (Jan 14) · Battle of Muktsar · 40 Muktas",        tradition: "Sikh" },
  { id: "guru-har-rai-jayanti",          label: "Guru Har Rai Ji Jayanti",            subtitle: "Magh 18 (Jan 31) · 7th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "guru-ravidas-jayanti",          label: "Guru Ravidas Ji Jayanti",            subtitle: "Phagan 1 (Feb 12) · Sant poet-saint's birth anniversary",  tradition: "Sikh" },
  { id: "hola-mohalla",                  label: "Hola Mohalla",                       subtitle: "Phagan 19 (Mar 4) · Khalsa martial arts festival",         tradition: "Sikh" },
  { id: "baisakhi-sikh",                 label: "Baisakhi (Vaisakhi)",                subtitle: "Vaisakh 1 (Apr 14) · Khalsa Sajna Divas",                 tradition: "Sikh" },
  { id: "guru-arjan-dev-shaheedi",       label: "Guru Arjan Dev Ji Shaheedi Divas",   subtitle: "Harh 2 (Jun 16) · 5th Guru's Martyrdom Day",              tradition: "Sikh" },
  { id: "guru-hargobind-jayanti",        label: "Guru Hargobind Ji Gurpurab",         subtitle: "Harh 5 (Jun 19) · 6th Guru's birth anniversary",          tradition: "Sikh" },
  { id: "guru-har-krishan-jayanti",      label: "Guru Har Krishan Ji Gurpurab",       subtitle: "Sawan 8 (Jul 23) · 8th Guru's birth anniversary",         tradition: "Sikh" },
  { id: "sangrand",                      label: "Sangrand",                           subtitle: "1st of each Nanakshahi month · 12 per year",              tradition: "Sikh" },
  { id: "guru-ram-das-jayanti",          label: "Guru Ram Das Ji Gurpurab",           subtitle: "Assu 24 (Oct 9) · 4th Guru's birth anniversary",          tradition: "Sikh" },
  { id: "guru-granth-sahib-gurgaddi",   label: "Guru Granth Sahib Ji Gurgaddi Divas",subtitle: "Katik 5 (Oct 20) · Eternal Guru enthroned",              tradition: "Sikh" },
  { id: "bandi-chhor-divas",            label: "Bandi Chhor Divas",                  subtitle: "Katik 5 (Oct 20) · Day of Liberation · coincides with Deepawali", tradition: "Sikh" },
  { id: "guru-nanak-gurpurab",          label: "Guru Nanak Dev Ji Gurpurab",          subtitle: "Katik 21 (Nov 5) · Founder of Sikhism's birth anniversary", tradition: "Sikh" },
  { id: "guru-tegh-bahadur-shaheedi",   label: "Guru Tegh Bahadur Ji Shaheedi Divas",subtitle: "Maghar 10 (Nov 24) · 9th Guru's Martyrdom Day",           tradition: "Sikh" },
  { id: "pooranmashi",                   label: "Pooranmashi",                        subtitle: "Full moon of each month · ~22/yr · gurdwara sangat, kirtan, langar",  tradition: "Sikh" },
  { id: "swaminarayan-jayanti",       label: "Swaminarayan Jayanti",  subtitle: "Chaitra Shukla Navami · Lord Swaminarayan's birth",    tradition: "Swaminarayan" },
  { id: "fuldol-swaminarayan",        label: "Fuldol",                subtitle: "Phalgun Purnima · flower festival before Holi",        tradition: "Swaminarayan" },
  { id: "annakut-swaminarayan",       label: "Annakut",               subtitle: "Day after Deepawali · Swaminarayan New Year offering",    tradition: "Swaminarayan" },
  { id: "ekadashi-swaminarayan-jan-1",label: "Swaminarayan Ekadashi", subtitle: "Ekadashi with strict satvik fast · no onion, garlic", tradition: "Swaminarayan" },
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
  { id: "iskcon-ekadashi",       label: "Ekadashi (Vaishnava)",  subtitle: "No grains · 24 days a year · Parana next morning",         tradition: "ISKCON" },
  { id: "janmashtami-iskcon",    label: "Janmashtami",           subtitle: "Midnight fast · Lord Krishna's appearance day",             tradition: "ISKCON" },
  { id: "gaura-purnima",         label: "Gaura Purnima",         subtitle: "Sri Chaitanya Mahaprabhu's appearance day",                 tradition: "ISKCON" },
  { id: "radhashtami",           label: "Radhashtami",           subtitle: "Srimati Radharani's appearance day",                        tradition: "ISKCON" },
  { id: "kartik-damodara",       label: "Kartik Damodara Month", subtitle: "Month-long vow · daily ghee lamp offering",                 tradition: "ISKCON" },
  { id: "nityananda-trayodashi",    label: "Nityananda Trayodashi",  subtitle: "Sri Nityananda Prabhu's appearance day",               tradition: "ISKCON" },
  { id: "narasimha-chaturdashi",    label: "Narasimha Chaturdashi",  subtitle: "Vaishakha Shukla 14 · fast until sunset · Nrsimha puja", tradition: "ISKCON" },
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
  { id: "ugadi-lingayat",            label: "Ugadi (Kannada New Year)", subtitle: "Feb 15 · Ishtalinga puja · Ugadi Pachadi",               tradition: "Lingayat" },
  { id: "maha-shivaratri-lingayat", label: "Maha Shivaratri",  subtitle: "Nirjala fast · all-night Ishtalinga worship",                tradition: "Lingayat" },
  { id: "somavara-lingayat",        label: "Shravana Somavara",   subtitle: "Mondays of Shravana · fruit fast · Ishtalinga puja to Lord Shiva",  tradition: "Lingayat" },
  { id: "basava-jayanti",           label: "Basava Jayanti",    subtitle: "Apr 20 · Basavanna's birth anniversary",                    tradition: "Lingayat" },
  { id: "varalakshmi-vratam-lingayat", label: "Varamahalakshmi Vratam", subtitle: "Aug 28 · Goddess Varamahalakshmi · women's vrat",          tradition: "Lingayat" },
  { id: "lakshmi-puja-lingayat",       label: "Lakshmi Puja — Deepawali", subtitle: "Nov 8 · Festival of lights · Ishtalinga puja first",  tradition: "Lingayat" },
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
  { id: "ekadashi-pushti-marg",    label: "Ekadashi",                subtitle: "Grain-free bhog · 26 days a year",                    tradition: "PushtiMarg" },
  { id: "janmashtami-pushti-marg", label: "Janmashtami",             subtitle: "Most sacred · Chappan Bhog at midnight",              tradition: "PushtiMarg" },
  { id: "annakut-pushti-marg",     label: "Annakut & Govardhan Puja",subtitle: "Day after Deepawali · Chappan Bhog seva",                tradition: "PushtiMarg" },
  { id: "phoolon-wali-holi",       label: "Phoolon wali Holi",       subtitle: "Falgun Purnima · flower Holi at Shrinathji's haveli", tradition: "PushtiMarg" },
  { id: "hindola-utsav",           label: "Hindola Utsav",           subtitle: "Ashadha Shukla 2 · 40-day swing festival",            tradition: "PushtiMarg" },
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

  { id: "guru-jambheshwar-jayanti",      label: "Guru Jambheshwar Jayanti",          subtitle: "Bhadrapada Krishna Ashtami · Jambhoji's birth · Pipasar",       tradition: "Bishnoi" },
  { id: "khejarli-shaheed-diwas",        label: "Khejarli Shaheed Diwas",            subtitle: "Amrita Devi & 363 martyrs (1730 CE) · Bhadrapada Sud 10",       tradition: "Bishnoi" },
  { id: "jambhoji-mukti-diwas",          label: "Jambhoji Mukti Diwas",              subtitle: "Magh Krishna Navami · mahaprayan at Lalasar Sathari",           tradition: "Bishnoi" },
  { id: "mukam-mela-asoj-amavasya",      label: "Mukam Mela (Asoj Amavasya)",        subtitle: "Autumn Bishnoi pilgrimage · Samrathal Dhora · Bikaner",         tradition: "Bishnoi" },
  { id: "mukam-mela-phalgun-amavasya",   label: "Mukam Mela (Phalgun Amavasya)",     subtitle: "Spring Bishnoi pilgrimage · before Holi · Mukam",               tradition: "Bishnoi" },
  { id: "bishnoi-holi",                  label: "Bishnoi Holi (Phalgun Purnima)",    subtitle: "Phool gulal only · no green wood · niyam #16",                  tradition: "Bishnoi" },
  { id: "bishnoi-mauni-amavasya",        label: "Mauni Amavasya (Monthly Amavasya)", subtitle: "Magha amavasya · silent fast · niyam #14",                      tradition: "Bishnoi" },
  { id: "bishnoi-guru-purnima",          label: "Guru Purnima (Bishnoi)",            subtitle: "Ashadh Purnima · Shabadvani recitation · 29 niyams",            tradition: "Bishnoi" },
  { id: "bishnoi-akshay-tritiya",        label: "Akshay Tritiya (Bishnoi)",          subtitle: "Vraksh-ropan · gau-daan · anna-daan",                           tradition: "Bishnoi" },
  { id: "bishnoi-devshayani-ekadashi",   label: "Devshayani Ekadashi (Chaturmas)",   subtitle: "Ashadh Shukla Ekadashi · 4-month vrat begins",                  tradition: "Bishnoi" },
  { id: "bishnoi-govardhan-puja",        label: "Govardhan Puja / Annakut",          subtitle: "Karthika Shukla Pratipada · gau-puja · niyam #19",              tradition: "Bishnoi" },
  { id: "bishnoi-hariyali-amavasya"           , label: "Hariyali Amavasya (Tree-Planting)"          , subtitle: "Shravana amavasya · vraksh-ropan · niyams 16-17"                       , tradition: "Bishnoi" },
  { id: "bishnoi-hariyali-teej"               , label: "Hariyali Teej"                              , subtitle: "Shravana Shukla Tritiya · Marwari women · monsoon"                     , tradition: "Bishnoi" },
  { id: "bishnoi-vat-savitri-amavasya"        , label: "Vat Savitri Amavasya"                       , subtitle: "Jyeshtha amavasya · banyan worship · married women"                    , tradition: "Bishnoi" },
  { id: "bishnoi-diwali-lakshmi-puja"         , label: "Diwali / Lakshmi Puja (No Crackers)"        , subtitle: "Karthika amavasya · ghee diyas · niyams 6-7"                           , tradition: "Bishnoi" },
  { id: "bishnoi-devuthani-ekadashi"          , label: "Devuthani Ekadashi (Chaturmas Ends)"        , subtitle: "Karthika Shukla Ekadashi · Vishnu wakes"                               , tradition: "Bishnoi" },
  { id: "bishnoi-tulsi-vivah"                 , label: "Tulsi Vivah"                                , subtitle: "Karthika Shukla Dwadashi · tulsi-shaligram wedding"                    , tradition: "Bishnoi" },
  { id: "bishnoi-karthika-purnima"            , label: "Karthika Purnima / Dev Diwali"              , subtitle: "Karthika Purnima · snan · ghee diyas"                                  , tradition: "Bishnoi" },
  { id: "bishnoi-nirjala-ekadashi"            , label: "Nirjala Ekadashi (Bhima Ekadashi)"          , subtitle: "Jyeshtha Shukla Ekadashi · 24-hr dry fast"                             , tradition: "Bishnoi" },
  { id: "bishnoi-maha-shivaratri"             , label: "Maha Shivaratri (Bishnoi)"                  , subtitle: "Magha Krishna Chaturdashi · all-night jagran"                          , tradition: "Bishnoi" },
  { id: "bishnoi-vasant-panchami"             , label: "Vasant Panchami / Saraswati Puja"           , subtitle: "Magha Shukla Panchami · akshar-abhyasam"                               , tradition: "Bishnoi" },
  { id: "bishnoi-ram-navami"                  , label: "Ram Navami"                                 , subtitle: "Chaitra Shukla Navami · Sri Ram's appearance"                          , tradition: "Bishnoi" },
  { id: "bishnoi-hanuman-jayanti"             , label: "Hanuman Jayanti"                            , subtitle: "Chaitra Purnima · Hanuman Chalisa · Sundara Kand"                      , tradition: "Bishnoi" },
  { id: "bishnoi-makar-sankranti"             , label: "Makar Sankranti / Uttarayan"                , subtitle: "Jan 14 · Surya arghya · til-laddu · no manjha"                         , tradition: "Bishnoi" },
  { id: "bishnoi-jajiwal-dham-mela"           , label: "Jajiwal Dham Mela"                          , subtitle: "Karthik Shukla Ashtami · Jodhpur · 14-mandir lineage"                  , tradition: "Bishnoi" },

  { id: "arya-samaj-sthapana-diwas",       label: "Arya Samaj Sthapana Diwas",              subtitle: "Apr 10 · founding day · Mumbai 1875 · Dayananda Saraswati",           tradition: "AryaSamaj" },
  { id: "dayananda-saraswati-jayanti",     label: "Dayananda Saraswati Jayanti",            subtitle: "Phalguna Krishna Dashami · birth at Tankara, Gujarat (1824)",          tradition: "AryaSamaj" },
  { id: "dayananda-nirvana-diwas",         label: "Dayananda Nirvana Diwas",                subtitle: "Karthika Krishna Amavasya (Diwali) · mahaprayan Ajmer 1883",           tradition: "AryaSamaj" },
  { id: "vasanta-navsamvatsar-arya",       label: "Vasanta Navsamvatsar (Vedic New Year)",  subtitle: "Chaitra Shukla Pratipada · Sristi Diwas · Vikram Samvat",              tradition: "AryaSamaj" },
  { id: "veda-prakatya-diwas",             label: "Veda Prakatya Diwas",                    subtitle: "Ashadh Shukla Purnima · revelation of the four Vedas",                 tradition: "AryaSamaj" },
  { id: "gayatri-jayanti-arya",            label: "Gayatri Jayanti",                        subtitle: "Jyeshtha Shukla Ekadashi · manifestation of Gayatri mantra",           tradition: "AryaSamaj" },
  { id: "virjananda-jayanti-arya",         label: "Swami Virjananda Jayanti",               subtitle: "Phalguna Krishna Tritiya · Dayananda's guru (Mathura)",                tradition: "AryaSamaj" },
  { id: "maharshi-bodh-diwas",             label: "Maharshi Bodh Diwas (Shivratri Bodh)",   subtitle: "Maha Shivaratri · 14yo Mool Shankar's awakening (1839)",               tradition: "AryaSamaj" },
  { id: "holika-dahan-yajna-arya",         label: "Holika Dahan Yajna",                     subtitle: "Phalguna Purnima eve · cleansing yajna (no waste burning)",            tradition: "AryaSamaj" },
  { id: "vasant-panchami-arya",            label: "Vasant Panchami (Vedic Saraswati)",      subtitle: "Magha Shukla Panchami · Veda-vani · vidyarambha",                      tradition: "AryaSamaj" },
  { id: "shravani-upakarma-arya",          label: "Shravani Upakarma",                      subtitle: "Shravana Purnima · yagnopavit dharan · Veda-paath upakarma",           tradition: "AryaSamaj" },
  { id: "ram-navami-arya",                 label: "Ram Navami (Vedic Maryada)",             subtitle: "Chaitra Shukla Navami · Sri Ram as Vedic Maryada Purushottam",          tradition: "AryaSamaj" },
  { id: "krishna-janmashtami-arya",        label: "Krishna Janmashtami (Vedic Yogi)",       subtitle: "Bhadrapada Krishna Ashtami · Sri Krishna as Vedic Yogeshwara",         tradition: "AryaSamaj" },
];

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

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3 mt-6 first:mt-0">
      {title}
    </p>
  );
}

type Section = "main" | "location" | "region" | "tradition" | "vrats" | "subscribe";
type Plan = "monthly" | "annual" | "lifetime";

export default function Settings() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>("main");
  const [saved, setSaved] = useState(false);

  const [tradition, setTradition] = useState<Tradition>(getUserTradition);
  const [observed, setObserved] = useState<string[]>(getObservedVrats);
  const [city, setCity] = useState(getUserCity);
  const [location, setLocationState] = useState<UserLocation>(getUserLocation);
  const [region, setRegion] = useState<UserRegion>(getUserRegion);

  // When the user changes country in Settings, reset region to "All" if the
  // currently-selected region doesn't exist in the new country's list.
  // Prevents an Indian region (e.g. maharashtra) being kept after switching to USA.
  const setLocation = useCallback((next: UserLocation) => {
    setLocationState(next);
    setRegion((prev) => (isValidRegionForLocation(prev, next) ? prev : "all"));
  }, []);

  const subscribed = isSubscribed();
  const daysRemaining = getDaysRemaining();
  const trialOver = isTrialExpired();

  const [subEmail, setSubEmail] = useState(getUserEmail);
  const [subPlan, setSubPlan] = useState<Plan>("annual");
  const [subCurrency, setSubCurrency] = useState<Currency | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  } | null>(null);

  useEffect(() => {
    if (section === "subscribe") {
      detectCurrency().then(setSubCurrency);
    }
  }, [section]);

  useEffect(() => {
    if (!subscribed) {
      setCancelInfo(null);
      return;
    }
    const email = getUserEmail();
    if (!email) return;

    let cancelled = false;
    fetch(`${API_BASE}/api/stripe/verify?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.subscribed) return;
        setCancelInfo({
          cancel_at_period_end: !!data.cancel_at_period_end,
          current_period_end: data.current_period_end ?? null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [subscribed]);

  function formatPeriodEnd(iso: string | null): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  const save = useCallback(() => {
    localStorage.setItem(TRADITION_KEY, tradition);
    localStorage.setItem(OBSERVED_KEY, JSON.stringify(observed));
    localStorage.setItem(CITY_KEY, city.trim());
    localStorage.setItem(LOCATION_KEY, location);
    localStorage.setItem(REGION_KEY, region);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (section !== "main") setSection("main");
  }, [tradition, observed, city, location, region, section]);

  async function handleSubscribe() {
    const email = subEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubError("Please enter a valid email address.");
      return;
    }
    if (!subCurrency) return;
    setUserEmail(email);
    setSubLoading(true);
    setSubError("");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: subPlan, currency: subCurrency }),
      });
      const data = await res.json();
      if (!res.ok) { setSubError(data.error || "Something went wrong. Please try again."); return; }
      if (data.url) window.location.href = data.url;
    } catch {
      setSubError("Could not connect. Please check your internet and try again.");
    } finally {
      setSubLoading(false);
    }
  }

  async function handleRestore() {
    const email = subEmail.trim();
    if (!email) { setSubError("Enter your email to restore access."); return; }
    setRestoring(true);
    setSubError("");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/verify?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.subscribed) { setSubscribed(); window.location.reload(); }
      else { setSubError("No active subscription found for this email."); }
    } catch {
      setSubError("Could not verify. Please check your internet connection.");
    } finally {
      setRestoring(false);
    }
  }

  async function handlePortal() {
    const email = getUserEmail();
    if (!email) return;
    setPortalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setPortalLoading(false);
    }
  }

  function toggleVrat(id: string) {
    setObserved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  const currentLocationInfo = LOCATION_OPTIONS.find((l) => l.id === location) ?? LOCATION_OPTIONS[0];
  const regionOptions = getRegionOptionsForLocation(location);
  const regionCopy = getRegionScreenCopy(location);
  const currentRegionInfo = regionOptions.find((r) => r.id === region) ?? regionOptions[0];
  const ACCENT = "#E07B2A";

  if (section === "location") {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button
            onClick={() => setSection("main")}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Change location</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Panchang dates follow IST. We'll show a regional note in the calendar for your area.
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
                    border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`,
                    background: selected ? `${ACCENT}12` : "white",
                  }}
                  data-testid={`settings-location-${opt.id}`}
                >
                  <span className="text-3xl flex-shrink-0">{opt.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.timezone}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {location !== getUserLocation() && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">{currentLocationInfo.note}</p>
            </div>
          )}

          <button
            onClick={save}
            className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          >
            Save location
          </button>
        </div>
      </div>
    );
  }

  if (section === "region") {
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button
            onClick={() => setSection("main")}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{regionCopy.title}</h2>
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
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{
                    border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`,
                    background: selected ? `${ACCENT}12` : "white",
                  }}
                  data-testid={`settings-region-${opt.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={save}
            className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          >
            Save region
          </button>
        </div>
      </div>
    );
  }

  if (section === "tradition") {
    // Order: Hindu / Jain / Sikh first (umbrella categories),
    // then the remaining 9 sub-traditions alphabetically.
    const OPTIONS: { value: Tradition; label: string; subtitle: string }[] = [
      { value: "Hindu",            label: "Hindu",                              subtitle: "Ekadashi, Navratri, Karva Chauth and more" },
      { value: "Jain",             label: "Jain",                               subtitle: "Paryushana, Navpad Oli, Samvatsari and more" },
      { value: "Sikh",             label: "Sikh",                               subtitle: "Gurpurabs, Baisakhi, Sangrand and more" },
      { value: "AryaSamaj",        label: "Arya Samaj (Vedic Dharma)",          subtitle: "Daily Sandhya & Havan, Sthapana Diwas, Dayananda Jayanti, Veda Prakatya" },
      { value: "Bishnoi",          label: "Bishnoi (Jambhoji panth)",           subtitle: "Guru Jambheshwar Jayanti, Khejarli Shaheed Diwas, Mukam Mela" },
      { value: "ISKCON",           label: "ISKCON / Vaishnava",                 subtitle: "Ekadashi (no grains), Gaura Purnima, Janmashtami, Kartik" },
      { value: "Lingayat",         label: "Lingayat / Veerashaiva",             subtitle: "Maha Shivaratri, Shravana Somavara, Basava Jayanti" },
      { value: "PushtiMarg",       label: "Pushti Marg / Vallabha Sampraday",   subtitle: "Ekadashi (seva-based), Janmashtami, Annakut, Hindola Utsav" },
      { value: "Ramanandi",        label: "Ramanandi Sampraday",                subtitle: "Full Vikram Samvat year — Ekadashi, Purnima, Sankashti, Chaturmas, Annakut, Holi & all Ayodhya festivals" },
      { value: "ShaivaSiddhanta",  label: "Shaiva Siddhanta (Tamil Shaiva)",    subtitle: "Maha Shivaratri, Pradosha, Aarudra Darshan, Karthigai Deepam" },
      { value: "Shakta",           label: "Shakta (Devi worship)",              subtitle: "Full Amavasyanta calendar — monthly Amavasya/Adya Kali, Sharadiya & Chaitra Navaratri, both Gupta Navaratris, Mahalaya, Phalaharini, Saraswati Puja, Jagaddhatri, Annapurna" },
      { value: "SriVaishnava",     label: "Sri Vaishnava (Iyengar)",            subtitle: "Bhagavata Ekadashi, all Azhwar/Acharya Tirunakshatrams, Panguni Uthiram, Garuda Sevai, Brahmotsavam — verify dates with your local SV panchangam" },
      { value: "Swaminarayan",     label: "Swaminarayan",                       subtitle: "Jayanti, Fuldol, Annakut and strict Ekadashi" },
      { value: "Warkari",          label: "Warkari (Vitthal-Vithoba)",          subtitle: "Pandharpur Wari, Tukaram Beej, Dnyaneshwar Punyatithi" },
    ];
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Tradition</h2>
          <p className="text-sm text-muted-foreground mb-6">Choose the tradition that matches your practice.</p>
          <div className="space-y-3">
            {OPTIONS.map((opt) => {
              const selected = tradition === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTradition(opt.value);
                    localStorage.setItem(TRADITION_KEY, opt.value);
                    setSection("main");
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ border: `2px solid ${selected ? ACCENT : "#E5E7EB"}`, background: selected ? `${ACCENT}12` : "white" }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.subtitle}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (section === "vrats") {
    const hinduVrats        = VRAT_OPTIONS.filter((v) => v.tradition === "Hindu");
    const jainVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Jain");
    const sikhVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Sikh");
    const swaminarayanVrats = VRAT_OPTIONS.filter((v) => v.tradition === "Swaminarayan");
    const iskconVrats       = VRAT_OPTIONS.filter((v) => v.tradition === "ISKCON");
    const lingayatVrats     = VRAT_OPTIONS.filter((v) => v.tradition === "Lingayat");
    const pushtiMargVrats   = VRAT_OPTIONS.filter((v) => v.tradition === "PushtiMarg");
    const warkariVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Warkari");
    const ramanandiVrats       = VRAT_OPTIONS.filter((v) => v.tradition === "Ramanandi");
    const sriVaishnavaVrats    = VRAT_OPTIONS.filter((v) => v.tradition === "SriVaishnava");
    const shaktaVrats          = VRAT_OPTIONS.filter((v) => v.tradition === "Shakta");
    const shaivaSiddhantaVrats = VRAT_OPTIONS.filter((v) => v.tradition === "ShaivaSiddhanta");
    const bishnoiVrats         = VRAT_OPTIONS.filter((v) => v.tradition === "Bishnoi");
    const aryaSamajVrats       = VRAT_OPTIONS.filter((v) => v.tradition === "AryaSamaj");
    const showHindu            = tradition === "Hindu";
    const showJain             = tradition === "Jain";
    const showSikh             = tradition === "Sikh";
    const showSwaminarayan     = tradition === "Swaminarayan";
    const showISKCON           = tradition === "ISKCON";
    const showLingayat         = tradition === "Lingayat";
    const showPushtiMarg       = tradition === "PushtiMarg";
    const showWarkari          = tradition === "Warkari";
    const showRamanandi        = tradition === "Ramanandi";
    const showSriVaishnava     = tradition === "SriVaishnava";
    const showShakta           = tradition === "Shakta";
    const showShaivaSiddhanta  = tradition === "ShaivaSiddhanta";
    const showBishnoi          = tradition === "Bishnoi";
    const showAryaSamaj        = tradition === "AryaSamaj";
    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">My vrats</h2>
          <p className="text-sm text-muted-foreground mb-4">Your starred vrats appear highlighted in the calendar.</p>

          {showHindu && (
            <>
              {hinduVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showJain && (
            <>
              {jainVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showSikh && (
            <>
              {sikhVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showSwaminarayan && (
            <>
              {swaminarayanVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showISKCON && (
            <>
              {iskconVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showLingayat && (
            <>
              {lingayatVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showPushtiMarg && (
            <>
              {pushtiMargVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showWarkari && (
            <>
              {warkariVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showRamanandi && (
            <>
              {ramanandiVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showSriVaishnava && (
            <>
              {sriVaishnavaVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showShakta && (
            <>
              {shaktaVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showShaivaSiddhanta && (
            <>
              {shaivaSiddhantaVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showBishnoi && (
            <>
              {bishnoiVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}
          {showAryaSamaj && (
            <>
              {aryaSamajVrats.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-3 border-b border-stone-100">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                  <Toggle on={isVratObserved(opt.id, observed)} onToggle={() => toggleVrat(opt.id)} />
                </div>
              ))}
            </>
          )}

          <button onClick={save} className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}>
            Save
          </button>
        </div>
      </div>
    );
  }

  if (section === "subscribe") {
    const c = subCurrency ?? "usd";
    const plans: { id: Plan; label: string; price: string; badge?: string; sub?: string }[] = [
      { id: "annual",   label: "Yearly",   price: PRICES.annual[c],   badge: "BEST VALUE", sub: "Save 44%" },
      { id: "monthly",  label: "Monthly",  price: PRICES.monthly[c]  },
      { id: "lifetime", label: "Lifetime", price: PRICES.lifetime[c], sub: "Pay once, yours forever" },
    ];

    return (
      <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
        <div className="max-w-md mx-auto px-5 pt-6 pb-8">
          <button onClick={() => setSection("main")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 -ml-1 active:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            Back
          </button>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Choose your plan</h2>
          <p className="text-sm text-muted-foreground mb-6">Unlock VRAT Premium — full access to all 140+ vrats, fasting guides, mantras, and katha.</p>

          <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3">Your email</p>
          <div className="vrat-card p-4 mb-6">
            <input
              type="email"
              value={subEmail}
              onChange={(e) => { setSubEmail(e.target.value); setSubError(""); }}
              placeholder="your@email.com"
              className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              inputMode="email"
              autoComplete="email"
              data-testid="sub-email-input"
            />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-amber-700 mb-3">Plan</p>
          {subCurrency === null ? (
            <div className="space-y-3 mb-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-full rounded-2xl animate-pulse" style={{ background: "#F5E6D3", height: 68 }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {plans.map((plan) => {
                const active = subPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSubPlan(plan.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
                    style={{
                      border: `2px solid ${active ? ACCENT : "#E5E7EB"}`,
                      background: active ? `${ACCENT}12` : "white",
                    }}
                    data-testid={`settings-plan-${plan.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{plan.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {plan.badge && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: active ? ACCENT : "#F3F4F6", color: active ? "white" : "#6B7280" }}>
                          {plan.badge}
                        </span>
                      )}
                      {plan.sub && (
                        <span className="text-xs" style={{ color: active ? "#9A3412" : "#9CA3AF" }}>{plan.sub}</span>
                      )}
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                        <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {subError && (
            <p className="text-xs text-red-600 text-center mb-3 px-2">{subError}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={subLoading || subCurrency === null}
            className="w-full py-4 rounded-2xl font-bold text-base text-white tracking-wide transition-opacity active:opacity-80 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
            data-testid="settings-subscribe-btn"
          >
            {subLoading ? "Redirecting to payment…" : subPlan === "lifetime" ? "Get Lifetime Access" : "Subscribe Now"}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            {subPlan === "lifetime" ? "Pay once · Full access forever · No renewal" : "Full access · Cancel anytime · No ads"}
          </p>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full text-center text-xs mt-5 py-2 transition-opacity active:opacity-50 disabled:opacity-40 text-muted-foreground"
            data-testid="settings-restore-btn"
          >
            {restoring ? "Checking…" : "Already subscribed? Restore access"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #FEF3E2 0%, #FFFBF5 100%)" }}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">{t("nav.settings")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Personalise your VRAT experience.</p>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600 flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 font-medium">Saved successfully</p>
          </div>
        )}

        <SectionHeader title="Location" />
        <button
          onClick={() => setSection("location")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-location"
        >
          <span className="text-2xl">{currentLocationInfo.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{currentLocationInfo.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{currentLocationInfo.timezone}</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          {currentLocationInfo.note}
        </p>

        <SectionHeader title="Region" />
        <button
          onClick={() => setSection("region")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-region"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{currentRegionInfo.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentRegionInfo.id === "all" ? "Showing all regional vrats" : "Regional vrats for your area are shown"}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="Tradition" />
        <button
          onClick={() => setSection("tradition")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-tradition"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{tradition}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tradition === "Hindu" ? "Hindu vrats only" : tradition === "Jain" ? "Jain vrats only" : tradition === "Sikh" ? "Sikh Gurpurabs and observances" : tradition === "Swaminarayan" ? "Swaminarayan vrats and festivals" : tradition === "ISKCON" ? "ISKCON / Vaishnava observances" : tradition === "Lingayat" ? "Lingayat / Veerashaiva observances" : tradition === "PushtiMarg" ? "Pushti Marg utsavs and Ekadashi" : `${tradition} observances`}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="My vrats" />
        <button
          onClick={() => setSection("vrats")}
          className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
          data-testid="settings-change-vrats"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{observed.length} vrat{observed.length !== 1 ? "s" : ""} selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to add or remove</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <SectionHeader title="City" />
        <div className="vrat-card p-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Delhi, London..."
            className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">Used for sunrise and moonrise calculations.</p>

        <button
          onClick={save}
          className="mt-6 w-full py-4 rounded-2xl font-semibold text-base text-white tracking-wide transition-opacity active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C86B1A 100%)` }}
          data-testid="settings-save"
        >
          Save changes
        </button>

        <SectionHeader title="Subscription" />
        {subscribed ? (
          <>
            <div className="vrat-card p-4 flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: cancelInfo?.cancel_at_period_end ? "#FEF3C7" : "#DCFCE7" }}
              >
                {cancelInfo?.cancel_at_period_end ? (
                  <svg viewBox="0 0 20 20" fill="#B45309" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="#16A34A" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Premium Active</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cancelInfo?.cancel_at_period_end && cancelInfo.current_period_end
                    ? `Cancels on ${formatPeriodEnd(cancelInfo.current_period_end)}`
                    : "Full access to all vrats and features"}
                </p>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-opacity active:opacity-70 disabled:opacity-50"
                style={{ background: "#F3F4F6", color: "#374151" }}
                data-testid="settings-manage-btn"
              >
                {portalLoading ? "…" : "Manage"}
              </button>
            </div>
            {cancelInfo?.cancel_at_period_end && cancelInfo.current_period_end && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your subscription is scheduled to end on{" "}
                  <span className="font-semibold">{formatPeriodEnd(cancelInfo.current_period_end)}</span>.
                  You'll keep full access until then. Tap{" "}
                  <span className="font-semibold">Manage</span> to resume your subscription.
                </p>
              </div>
            )}
          </>
        ) : trialOver ? (
          <button
            onClick={() => setSection("subscribe")}
            className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
            data-testid="settings-subscribe-card"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FEE2E2" }}>
              <svg viewBox="0 0 20 20" fill="#DC2626" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Free trial ended</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subscribe to continue your vrat journey</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        ) : (
          <button
            onClick={() => setSection("subscribe")}
            className="w-full vrat-card p-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
            data-testid="settings-subscribe-card"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FEF3C7" }}>
              <svg viewBox="0 0 20 20" fill="#D97706" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Free Trial — {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</p>
              <p className="text-xs text-muted-foreground mt-0.5">Subscribe now to keep full access</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        )}

        <SectionHeader title="Install" />
        <a
          href="/how-to-install"
          className="w-full vrat-card p-4 flex items-center gap-3 text-left active:opacity-70 transition-opacity"
          data-testid="settings-how-to-install"
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">🪔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">How to install VRAT</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen in seconds</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>

        <div className="mt-8 pt-6 border-t border-stone-200">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">About</p>
          <div className="space-y-3">
            <a href="/privacy" className="flex items-center justify-between vrat-card p-4 text-sm text-foreground active:opacity-70">
              Privacy Policy
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground"><path d="M9 18l6-6-6-6" /></svg>
            </a>
            <a href="/terms" className="flex items-center justify-between vrat-card p-4 text-sm text-foreground active:opacity-70">
              Terms of Use
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground"><path d="M9 18l6-6-6-6" /></svg>
            </a>
          </div>
        </div>

        <PageFooter />
      </div>
    </div>
  );
}
